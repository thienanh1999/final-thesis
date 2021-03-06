import json
import os
import random

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from rest_framework import status
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.decorators import action, parser_classes
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
from .serializers import UserSerializer, UserLoginSerializer, ProjectSerializer, ProjectMemberSerializer, \
    ClaimSerializer
from django.conf import settings
from .utils import *
from .data_utils import *
from rest_framework.parsers import MultiPartParser
from elasticsearch import Elasticsearch, helpers
from django.db import transaction
import requests


# Create your views here.


class UserRegisterView(APIView):
    @staticmethod
    def post(request):
        serializer = UserSerializer(data=request.data)
        if request.data.get('phone') is None:
            return Response({
                'errors': 'phone is required'
            }, status.HTTP_400_BAD_REQUEST)
        if serializer.is_valid():
            serializer.validated_data['password'] = make_password(
                serializer.validated_data['password'])
            serializer.save()

            user = User.objects.filter(email=request.data['email'], is_deleted=False).first()
            result = user.to_dict()
            result['phone'] = user.phone
            result['gender'] = "MALE" if user.gender == 0 else "FEMALE"
            return Response(result, status=status.HTTP_201_CREATED)

        else:
            return JsonResponse({
                'message': 'This email or phone has already exist!',
            }, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    @staticmethod
    def post(request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                request,
                username=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            if user:
                refresh = TokenObtainPairSerializer.get_token(user)
                data = {
                    'message': 'Login successfully!',
                    'email': str(user),
                    'user_id': int(user.id),
                    'full_name': user.full_name,
                    'is_superuser': user.is_superuser,
                    'refresh_token': str(refresh),
                    'access_token': str(refresh.access_token),
                    'access_expires': int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                    'refresh_expires': int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
                }
                return Response(data, status=status.HTTP_200_OK)

            return Response({
                'message': 'Email or password is incorrect!',
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    @staticmethod
    def post():
        return Response({
            'message': 'Logout successfully!',
        }, status=status.HTTP_200_OK)


class SearchMemberView(APIView):
    @staticmethod
    def get(request):
        user = User.objects.filter(email=request.user, is_deleted=False).first()
        if user is None:
            return Response({}, status.HTTP_401_UNAUTHORIZED)
        users = User.objects.filter(full_name=request.data['full_name'], is_deleted=False)
        data = []
        for u in users:
            data.append(u.to_dict())
        return Response({
            'users': data
        }, status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_deleted=False)

    @is_admin
    def destroy(self, request, pk=None):
        user = self.queryset.filter(pk=pk).filter(is_deleted=False).first()
        if user is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        user.is_deleted = True
        user.save()
        return Response({}, status.HTTP_204_NO_CONTENT)

    @auth
    def list(self, request):
        queryset = self.queryset.filter(is_deleted=False)
        pagination = PageNumberPagination()
        users = pagination.paginate_queryset(queryset, request)
        result = []
        for user in users:
            result.append(user.to_dict())
        return Response({
            'count': pagination.page.paginator.count,
            'previous': pagination.get_previous_link(),
            'next': pagination.get_next_link(),
            'results': result
        }, status.HTTP_200_OK)

    @auth
    def retrieve(self, request, pk=None):
        user = self.queryset.filter(pk=pk).filter(is_deleted=False).first()
        if user is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        return Response(user.to_dict(), status.HTTP_200_OK)

    @is_admin
    def update(self, request, pk=None):
        user = self.queryset.filter(pk=pk).first()
        if user is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        try:
            update_model(user, request.data, ['phone', 'gender', 'full_name'])
            return Response(user.to_dict(), status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'errors': str(e)}, status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    @staticmethod
    def put(request):
        user = User.objects.filter(email=request.user, is_deleted=False).first()
        if user is None:
            return Response({}, status.HTTP_401_UNAUTHORIZED)
        if request.data.get('password') is None:
            return Response({
                'errors': 'New Password required'
            }, status.HTTP_400_BAD_REQUEST)
        user.password = make_password(request.data['password'])
        user.save()
        return Response({}, status.HTTP_201_CREATED)


class UpdateUserProfileView(APIView):
    @staticmethod
    def put(request):
        user = User.objects.filter(email=request.user, is_deleted=False).first()
        if user is None:
            return Response({}, status.HTTP_401_UNAUTHORIZED)
        if request.data.get('full_name') is not None:
            user.full_name = request.data['full_name']
        if request.data.get('gender') is not None:
            user.gender = request.data['gender']
        user.save()
        result = user.to_dict()
        result['phone'] = user.phone
        result['gender'] = "MALE" if user.gender == 0 else "FEMALE"
        return Response(result, status.HTTP_201_CREATED)


class FileUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        try:
            print(request.FILES)
            up_file = request.FILES['file']
            with open('/tmp/temp.json', 'wb+') as new_file:
                for chunk in up_file.chunks():
                    new_file.write(chunk)

            client = Elasticsearch('52.221.198.189:9200', timeout=30)
            client.indices.delete(
                index=request.data['es_id'], ignore=[400, 404])
            client.indices.create(
                index=request.data['es_id'],
                body={
                    'settings': {
                        'number_of_shards': 2,
                        'number_of_replicas': 2,
                        'analysis': {
                            'analyzer': "vi_analyzer"
                        }
                    }
                },
                ignore=400
            )
            json_file = open('/tmp/temp.json', 'r')
            data = json.load(json_file)
            print(len(data))
            print('Indexing {}'.format(request.data['es_id']))
            resp = helpers.bulk(
                client,
                data,
                index=request.data['es_id'],
            )

            print("helpers.bulk() RESPONSE:", resp)
            print("helpers.bulk() RESPONSE:", json.dumps(resp, indent=4))

            return Response({
                'result': 201,
                'message': "T???i l??n d??? li???u th??nh c??ng",
                'logs': resp
            }, status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({
                'message': "T???i l??n d??? li???u th???t b???i",
                'logs': str(e)
            }, status.HTTP_503_SERVICE_UNAVAILABLE)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.filter(is_deleted=False)
    serializer_class = ProjectSerializer

    @auth
    @parser_classes([MultiPartParser])
    @transaction.atomic
    def create(self, request):
        user = User.objects.filter(email=request.user, is_deleted=False).first()
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response({
                'errors': serializer.errors
            }, status.HTTP_400_BAD_REQUEST)
        project = self.queryset.filter(es_id=request.data['es_id']).first()

        if project is not None:
            return Response({
                'errors': 'es_id already exist'
            }, status.HTTP_400_BAD_REQUEST)

        try:
            # Save temp file
            print("Received file ", request.FILES)
            uploaded_file = request.FILES['file']
            filename = '/tmp/' + request.data['es_id'] + '.json'
            with open(filename, 'wb+') as new_file:
                for chunk in uploaded_file.chunks():
                    new_file.write(chunk)

            json_file = open(filename, 'r')
            data = json.load(json_file)
            data_length = len(data)
            os.remove(filename)
            print('data length: ' + str(data_length))

            # Validate data
            validate_data = validate_uploaded_document(data)
            if validate_data is not None:
                return Response({'errors': validate_data}, status.HTTP_400_BAD_REQUEST)

            # Add document id
            data = add_id_to_docs(0, data)

            # Upload to ES
            print('Indexing {}'.format(request.data['es_id']))
            client = Elasticsearch(settings.ELASTICSEARCH_SERVER, timeout=50)
            client.indices.create(
                index=request.data['es_id'],
                body={
                    'settings': {
                        'number_of_shards': 2,
                        'number_of_replicas': 2,
                        'analysis': {
                            'analyzer': "vi_analyzer"
                        }
                    }
                },
                ignore=400
            )
            resp = helpers.bulk(
                client,
                data,
                index=request.data['es_id'],
            )

            print("helpers.bulk() RESPONSE:", json.dumps(resp, indent=4))
            if (resp[0] == data_length):
                # Index successfully
                project = serializer.save(owner=user)
                ProjectMember.objects.create(user=user, project=project)
                documents = []
                for doc in data:
                    document = Document.objects.filter(project=project, doc_id=doc['_id']).first()
                    if document is None:
                        documents.append(Document(project=project, doc_id=doc['_id'], uploader=user))
                Document.objects.bulk_create(documents)
                return Response(get_project_info(project.id), status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'result': 503,
                'message': "T???i l??n d??? li???u th???t b???i",
                'logs': str(e)
            }, status.HTTP_503_SERVICE_UNAVAILABLE)

    @auth
    def retrieve(self, request, pk=None):
        project_info = get_project_info(pk)
        if project_info is None:
            return Response({
                'errors': 'Project is not exists'
            }, status.HTTP_404_NOT_FOUND)
        else:
            return Response(project_info, status.HTTP_200_OK)

    @auth
    def list(self, request):
        user = User.objects.filter(email=request.user, is_deleted=False).first()
        project_members = ProjectMember.objects.filter(user=user)
        projects = []
        for project_member in project_members:
            if not project_member.project.is_deleted:
                projects.append(project_member.project.to_dict())
        return Response({
            'count': len(projects),
            'projects': projects
        }, 200)

    @action(detail=False, methods=['get'])
    @is_admin
    def list_all(self, request):
        queryset = self.queryset
        pagination = PageNumberPagination()
        projects = pagination.paginate_queryset(queryset, request)
        result = []
        for project in projects:
            result.append(project.to_dict())
        return Response({
            'count': pagination.page.paginator.count,
            'previous': pagination.get_previous_link(),
            'next': pagination.get_next_link(),
            'results': result
        }, status.HTTP_200_OK)

    @auth
    def update(self, request, pk=None):
        project = self.queryset.filter(pk=pk).first()
        if project is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        user = User.objects.filter(email=request.user).first()
        if user.is_superuser or project.owner == user:
            update_model(project, request.data, ['name', 'description', 'num_sequence_highlight',
                                                 'min_table_row_highlight', 'max_table_row_highlight', 'k', 'b1'])
            return Response(project.to_dict(), status.HTTP_201_CREATED)
        else:
            return Response({}, status.HTTP_403_FORBIDDEN)

    @auth
    def destroy(self, request, pk=None):
        project = self.queryset.filter(pk=pk).first()
        if project is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        user = User.objects.filter(email=request.user).first()
        if user.is_superuser or project.owner == user:
            project.is_deleted = True
            project.save()
            return Response({}, status.HTTP_204_NO_CONTENT)
        else:
            return Response({}, status.HTTP_403_FORBIDDEN)

    @action(methods=['post'], detail=False)
    @is_project_member
    @parser_classes([MultiPartParser])
    @transaction.atomic
    def upload_file(self, request):
        project = self.queryset.filter(pk=request.data['project_id']).first()

        try:
            # Create temp file
            print("Received file ", request.FILES)
            uploaded_file = request.FILES['file']
            filename = '/tmp/' + project.es_id + '.json'
            with open(filename, 'wb+') as new_file:
                for chunk in uploaded_file.chunks():
                    new_file.write(chunk)
            json_file = open(filename, 'r')
            data = json.load(json_file)
            data_length = len(data)
            os.remove(filename)
            print('data length: ' + str(data_length))

            # Validate data
            validate_data = validate_uploaded_document(data)
            if validate_data is not None:
                return Response({'errors': validate_data}, status.HTTP_400_BAD_REQUEST)

            # Add document id
            document = Document.objects.filter(project=project).order_by('-doc_id')[:1].first()
            data = add_id_to_docs(document.doc_id + 1, data)

            # Upload to ES
            print('Indexing {}'.format(project.es_id))
            client = Elasticsearch(settings.ELASTICSEARCH_SERVER, timeout=50)
            client.indices.create(
                index=project.es_id,
                body={
                    'settings': {
                        'number_of_shards': 2,
                        'number_of_replicas': 2,
                        'analysis': {
                            'analyzer': "vi_analyzer"
                        }
                    }
                },
                ignore=400
            )
            resp = helpers.bulk(
                client,
                data,
                index=project.es_id,
            )

            print("helpers.bulk() RESPONSE:", json.dumps(resp, indent=4))
            if (resp[0] == data_length):
                # Index successfully
                documents = []
                user = User.objects.filter(email=request.user).first()
                for doc in data:
                    document = Document.objects.filter(project=project, doc_id=doc['_id']).first()
                    if document is None:
                        documents.append(Document(project=project, doc_id=doc['_id'], uploader=user))
                Document.objects.bulk_create(documents)
                return Response(get_project_info(project.id), status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'message': "T???i l??n d??? li???u th???t b???i",
                'logs': str(e)
            }, status.HTTP_503_SERVICE_UNAVAILABLE)

    @action(detail=False, methods=['POST'])
    @is_project_member
    def download(self, request):
        labeled_claims = Claim.objects.filter(is_labeled=True).exclude(label='SKIPPED')
        data_set = []
        for claim in labeled_claims:
            data = {
                'id': claim.id,
                'label': claim.label,
                'claim': claim.content,
                'evidence': [],
                'annotator_operation': []
            }
            for set_id in range(1, 4):
                evidences = Evidence.objects.filter(claim=claim, set=set_id)
                if evidences.count() == 0:
                    break
                set_data = []
                for evidence in evidences:
                    set_data.append(evidence.get_context())
                data['evidence'].append(set_data)

                annotators = Annotator.objects.filter(claim=claim, set=set_id).order_by('time')
                set_data = []
                for annotator in annotators:
                    set_data.append({
                        'time': annotator.time,
                        'operation': annotator.operation,
                        'value': annotator.get_value()
                    })
                data['annotator_operation'].append(set_data)
            data_set.append(data)
        return Response({'dataset': data_set}, status.HTTP_200_OK)


class ProjectMemberViewSet(viewsets.ModelViewSet):
    queryset = ProjectMember.objects.all()
    serializer_class = ProjectMemberSerializer

    @is_project_owner
    def create(self, request):
        project = Project.objects.filter(id=request.data['project_id'], is_deleted=False).first()
        user_ids = request.data['user_ids']
        project_members = []
        for user_id in user_ids:
            user = User.objects.filter(pk=user_id, is_deleted=False).first()
            if user is None:
                return Response({
                    'errors': 'User ' + str(user_id) + ' is not exist'
                }, status.HTTP_404_NOT_FOUND)
            project_member = self.queryset.filter(project=project, user=user).first()
            if project_member is not None:
                return Response({
                    'errors': 'User ' + str(user_id) + ' already in project'
                }, status.HTTP_400_BAD_REQUEST)
            project_members.append(ProjectMember(project=project, user=user))
        ProjectMember.objects.bulk_create(project_members)
        project_members = self.queryset.filter(project=project)
        return Response({
            'project_id': project.id,
            'project_member': set(project_member.user.id for project_member in project_members)
        }, status.HTTP_201_CREATED)

    @action(methods=['delete'], detail=False)
    @is_project_owner
    def delete(self, request):
        project = Project.objects.filter(id=request.data['project_id'], is_deleted=False).first()
        user_ids = request.data['user_ids']
        project_members = []
        for user_id in user_ids:
            user = User.objects.filter(pk=user_id).first()
            if user is None:
                return Response({
                    'errors': 'User ' + str(user_id) + ' is not exist'
                }, status.HTTP_404_NOT_FOUND)
            project_member = self.queryset.filter(project=project, user=user).first()
            if project_member is None:
                return Response({
                    'errors': 'User ' + str(user_id) + ' not in project'
                }, status.HTTP_400_BAD_REQUEST)
            project_members.append(project_member)
        for item in project_members:
            item.delete()
        project_members = self.queryset.filter(project=project)
        return Response({
            'project_id': project.id,
            'project_member': set(project_member.user.id for project_member in project_members)
        }, status.HTTP_201_CREATED)


class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer

    @action(detail=False, methods=['post'])
    @is_project_member
    def highlight(self, request, pk=None):
        project = Project.objects.filter(id=request.data['project_id'], is_deleted=False).first()
        user = User.objects.filter(email=request.user).first()
        document = Document.objects.filter(project=project, assigned_to=user, is_processed=False).first()

        # Get assigned document
        if document is not None:
            path = 'http://{}/{}/_doc/{}'.format(settings.ELASTICSEARCH_SERVER, project.es_id, document.doc_id)
            document_data = requests.get(path).json()

            highlight = []
            table = TableData.objects.filter(document=document, is_highlighted=True).first()
            if table is not None:
                highlight.append('table_{}'.format(table.id_in_document))
            else:
                sentences = Sentence.objects.filter(document=document, is_highlighted=True)
                for sentence in sentences:
                    highlight.append('sentence_{}'.format(sentence.id_in_document))
            return Response({
                'doc_id': document.doc_id,
                'highlight': highlight,
                'document_id': document.id,
                'document_data': document_data['_source']
            }, status.HTTP_200_OK)

        # Find new Document to highlight
        try:
            highlight = []
            while len(highlight) == 0:
                # Random document
                query_set = Document.objects.filter(project=project, is_processed=False)
                if query_set.count() == 0:
                    return Response({
                        'errors': 'There is no document left'
                    }, status.HTTP_400_BAD_REQUEST)
                document = query_set[random.randint(0, query_set.count() - 1)]
                document.assigned_to = user
                document.save()

                # Get Config and Document Data
                path = 'http://{}/{}/_doc/{}'.format(settings.ELASTICSEARCH_SERVER, project.es_id, document.doc_id)
                document_data = requests.get(path).json()
                order = document_data['_source']['order']
                seq_num = project.num_sequence_highlight
                min_row = project.min_table_row_highlight
                max_row = project.max_table_row_highlight

                # Check if highlight table or sentences
                document_has_table = False
                document_max_continuous_seq = 0
                count_seq = 0
                tables = []
                for item in order:
                    if item[0:5] == 'table':
                        count_seq = 0
                        table = document_data['_source'][item]['table']
                        if min_row <= len(table) <= max_row:
                            document_has_table = True
                            tables.append(item)
                    else:
                        count_seq += 1
                        document_max_continuous_seq = max(document_max_continuous_seq, count_seq)
                get_table = False
                if document_has_table and min_row <= max_row and max_row > 0:
                    get_table = random.choice([True, False])
                if document_max_continuous_seq < seq_num:
                    if document_has_table:
                        get_table = True
                    else:
                        continue

                # Get Highlight List
                if get_table:
                    # Add table to highlight list
                    highlight.append(random.choice(tables))
                else:
                    # Add sentences to highlight list
                    count = 0
                    while len(highlight) < seq_num:
                        count += 1
                        # Too lazy :>
                        if count == 99:
                            highlight = []
                            break
                        random_index = random.randint(0, len(order) - 1 - seq_num)
                        # Check seq_num sentences from random sentence
                        if order[random_index][0:8] == 'sentence':
                            highlight = [order[random_index]]
                            for i in range(1, seq_num):
                                if order[i + random_index][0:8] == 'sentence':
                                    # Is sentence -> add to highlight list
                                    highlight.append(order[i + random_index])
                                else:
                                    # Clear highlight list and start again
                                    highlight = []
                                    break

                # Add sentence, table_data, cells in highlight list to databases
                sentences = []
                cells = []
                if len(highlight) > 0:
                    for item in highlight:
                        if item[0:5] == 'table':
                            table = TableData.objects.create(
                                document=document,
                                id_in_document=int(item[6:]),
                                is_highlighted=True
                            )
                            table_data = document_data['_source'][item]['table']
                            for row in range(0, len(table_data) - 1):
                                row_data = table_data[row]
                                for column in range(0, len(row_data) - 1):
                                    cell = row_data[column]
                                    cells.append(Cell(
                                        row=row,
                                        col=column,
                                        is_header=cell['is_header'] or False,
                                        table_data=table,
                                        context='{}_{}_{}_{}'.format(document.doc_id, item, row, column)
                                    ))
                        else:
                            sentences.append(Sentence(
                                document=document,
                                is_highlighted=True,
                                id_in_document=int(item[9:]),
                                context='{}_{}'.format(document.doc_id, item)
                            ))
                else:
                    document.is_processed = True
                    document.save()
                    continue
                Sentence.objects.bulk_create(sentences)
                Cell.objects.bulk_create(cells)

                return Response({
                    'doc_id': document.doc_id,
                    'highlight': highlight,
                    'document_id': document.id,
                    'document_data': document_data['_source']
                }, status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'errors': str(e)
            }, status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['PUT'])
    @is_project_member
    def skip(self, request, pk=None):
        document = Document.objects.filter(pk=pk).first()
        if document is None:
            return Response({}, status.HTTP_404_NOT_FOUND)
        document.is_processed = True
        document.save()
        return Response({}, status.HTTP_201_CREATED)

    @is_project_member
    def create(self, request):
        user = User.objects.filter(email=request.user).first()
        project = Project.objects.filter(id=request.data['project_id'], is_deleted=False).first()
        document = Document.objects.filter(id=request.data['document_id'], is_processed=False, project=project).first()
        if document is None:
            return Response({
                'errors': 'Document is not exist'
            }, status.HTTP_404_NOT_FOUND)
        if document.assigned_to != user:
            return Response({
                'errors': 'This document not assigned to you'
            }, status.HTTP_403_FORBIDDEN)
        document.is_processed = True
        document.save()
        result = {}
        if request.data.get('claim_1') is not None:
            claim_1 = Claim.objects.create(project=project, document=document,
                                           type=1, content=request.data['claim_1'], created_by=user)
            result['claim_1'] = claim_1.to_dict()
        if request.data.get('claim_2') is not None:
            claim_2 = Claim.objects.create(project=project, document=document,
                                           type=2, content=request.data['claim_2'], created_by=user)
            result['claim_2'] = claim_2.to_dict()
        if request.data.get('claim_3') is not None and 1 <= request.data['sub_type'] <= 5:
            claim_3 = Claim.objects.create(project=project, document=document,
                                           type=3, sub_type=request.data['sub_type'],
                                           content=request.data['claim_3'], created_by=user)
            result['claim_3'] = claim_3.to_dict()
        return Response(result, status.HTTP_201_CREATED)

    @is_project_member
    def list(self, request):
        project = Project.objects.filter(id=request.data['project_id'], is_deleted=False).first()
        user = User.objects.filter(email=request.user).first()
        claims = Claim.objects.filter(project=project, created_by=user)
        pagination = PageNumberPagination()
        claims = pagination.paginate_queryset(claims, request)
        result = []
        for claim in claims:
            result.append(claim.to_dict())
        return Response({
            'count': pagination.page.paginator.count,
            'previous': pagination.get_previous_link(),
            'next': pagination.get_next_link(),
            'results': result
        })

    def update(self, request, pk=None):
        if pk is None:
            return Response({
                'errors': 'claim id should not be None'
            }, status.HTTP_400_BAD_REQUEST)
        claim = Claim.objects.filter(pk=pk).first()
        if claim is None:
            return Response({
                'errors': 'Claim is not exist'
            }, status.HTTP_404_NOT_FOUND)
        user = User.objects.filter(email=request.user).first()
        if claim.created_by != user and claim.project.owner != user:
            return Response({
                'errors': 'Claim created by other'
            }, status.HTTP_403_FORBIDDEN)
        if claim.label == 'PICKED' or claim.is_labeled:
            return Response({
                'errors': 'Claim has been annotated'
            }, status.HTTP_403_FORBIDDEN)
        claim.content = request.data['content']
        if claim.type == 3 and request.data.get('sub_type') is not None:
            claim.sub_type = request.data['sub_type']
        claim.save()
        return Response(claim.to_dict(), status.HTTP_201_CREATED)


class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.all()

    @action(detail=False, methods=["post"])
    @is_project_member
    def get_claim(self, request, pk=None):
        project = Project.objects.filter(id=request.data['project_id'], is_deleted=False).first()
        user = User.objects.filter(email=request.user).first()
        claim = Claim.objects.filter(label='PICKED', project=project, annotated_by=user).first()
        if claim is not None:
            return Response({
                'claim_id': claim.id,
                'claim': claim.content
            }, status.HTTP_200_OK)

        queryset = Claim.objects.exclude(label='PICKED').filter(project=project, is_labeled=False)
        if queryset.count() == 0:
            return Response({
                'errors': 'There is no claim left'
            }, status.HTTP_400_BAD_REQUEST)
        claim = queryset[random.randint(0, queryset.count() - 1)]
        claim.label = 'PICKED'
        claim.annotated_by = user
        claim.save()
        return Response({
            'claim_id': claim.id,
            'claim': claim.content
        }, status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    @is_project_member
    def skip(self, request, pk=None):
        if pk is None:
            return Response({
                'errors': 'claim id should not be None'
            }, status.HTTP_400_BAD_REQUEST)
        claim = Claim.objects.filter(pk=pk).first()
        if claim is None:
            return Response({
                'errors': 'claim is not exist'
            }, status.HTTP_404_NOT_FOUND)
        project = Project.objects.filter(pk=request.data['project_id'], is_deleted=False).first()
        if claim.project != project:
            return Response({
                'errors': 'claim is not in project'
            }, status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(email=request.user).first()
        if claim.annotated_by != user:
            return Response({
                'errors': 'claim is not assigned to you'
            }, status.HTTP_403_FORBIDDEN)
        if claim.label != 'PICKED':
            return Response({
                'errors': 'claim has been labeled'
            }, status.HTTP_400_BAD_REQUEST)

        claim.label = 'SKIPPED'
        claim.is_labeled = True
        claim.save()
        return Response({}, status.HTTP_201_CREATED)

    @is_project_member
    @transaction.atomic
    def create(self, request):
        user = User.objects.filter(email=request.user).first()
        project = Project.objects.filter(id=request.data['project_id'], is_deleted=False).first()
        claim = Claim.objects.filter(
            id=request.data['claim_id'], project=project).first()
        if claim is None:
            return Response({
                'errors': 'Claim is not exist in project'
            }, status.HTTP_404_NOT_FOUND)

        if claim.label == 'PICKED' and claim.annotated_by != user:
            return Response({
                'errors': 'Another user is annotating this claim'
            }, status.HTTP_403_FORBIDDEN)

        # Update claim label with evidences and annotators
        claim.label = request.data['label']
        claim.annotated_by = user
        claim.is_labeled = True
        claim.save()
        try:
            evidence_set = request.data['evidence']
            set_id = 0
            for evidence_datas in evidence_set:
                set_id += 1
                for evidence in evidence_datas:
                    doc_id = evidence[0]
                    document = Document.objects.filter(project=project, doc_id=doc_id).first()
                    if document is None:
                        claim.is_labeled = False
                        claim.save()
                        return Response({
                            'errors': 'doc_id is not exist in ' + str(evidence)
                        }, status.HTTP_400_BAD_REQUEST)
                    if len(evidence) == 2:
                        sentence_id = evidence[1]
                        sentence = Sentence.objects.filter(document=document, id_in_document=sentence_id).first()
                        if sentence is None:
                            sentence = Sentence.objects.create(document=document,
                                                               id_in_document=sentence_id,
                                                               context='{}_sentence_{}'.format(doc_id, sentence_id),
                                                               is_highlighted=False)
                        Evidence.objects.create(claim=claim, sentence=sentence, set=set_id)
                    else:
                        table_id = evidence[1]
                        row = evidence[2]
                        col = evidence[3]
                        table_data = TableData.objects.filter(document=document, id_in_document=table_id).first()
                        if table_data is None:
                            table_data = TableData.objects.create(document=document,
                                                                  id_in_document=table_id,
                                                                  is_highlighted=False)
                        cell = Cell.objects.filter(table_data=table_data, row=row, col=col).first()
                        if cell is None:
                            cell = Cell.objects.create(table_data=table_data,
                                                       row=row, col=col,
                                                       is_header=(row == 1),
                                                       context='{}_table{}_{}_{}'.format(doc_id, table_id, row, col))
                        Evidence.objects.create(claim=claim, cell=cell, set=set_id)

            annotate_set = request.data['annotator_operation']
            set_id = 0
            for annotate_data in annotate_set:
                set_id += 1
                print(annotate_data)
                for annotation in annotate_data:
                    print(annotation)
                    operation = annotation['operation']
                    time = annotation['time']
                    value = annotation['value']
                    if operation == "start" or operation == "search":
                        Annotator.objects.create(claim=claim, time=time, operation=operation, value=value[0], set=set_id)
                    else:
                        print("highlight")
                        print(value)
                        doc_id = value[0]
                        document = Document.objects.filter(project=project, doc_id=doc_id).first()
                        if document is None:
                            claim.is_labeled = False
                            claim.save()
                            return Response({
                                'errors': 'doc_id is not exist in ' + str(doc_id)
                            }, status.HTTP_400_BAD_REQUEST)
                        if len(value) == 1:
                            Annotator.objects.create(claim=claim, time=time, operation=operation, document=document, set=set_id)
                        elif len(value) == 2:
                            sentence_id = value[1]
                            sentence = Sentence.objects.filter(document=document, id_in_document=sentence_id).first()
                            if sentence is None:
                                sentence = Sentence.objects.create(document=document,
                                                                   id_in_document=sentence_id,
                                                                   context='{}_sentence_{}'.format(doc_id, sentence_id),
                                                                   is_highlighted=False)
                            Annotator.objects.create(claim=claim, time=time, operation=operation, sentence=sentence, set=set_id)
                        else:
                            table_id = value[1]
                            row = value[2]
                            col = value[3]
                            table_data = TableData.objects.filter(document=document, id_in_document=table_id).first()
                            if table_data is None:
                                table_data = TableData.objects.create(document=document,
                                                                      id_in_document=table_id,
                                                                      is_highlighted=False)
                            cell = Cell.objects.filter(table_data=table_data, row=row, col=col).first()
                            if cell is None:
                                cell = Cell.objects.create(table_data=table_data,
                                                           row=row, col=col,
                                                           is_header=(row == 1),
                                                           context='{}_table{}_{}_{}'.format(doc_id, table_id, row,
                                                                                             col))
                            Annotator.objects.create(claim=claim, time=time, operation=operation, cell=cell, set=set_id)

            return Response({}, status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "errors": str(e)
            }, status.HTTP_400_BAD_REQUEST)


def get_project_info(project_id):
    project = Project.objects.filter(id=project_id, is_deleted=False).first()
    if project is None:
        return None
    project_members = ProjectMember.objects.filter(project=project)
    member_data = []
    for project_member in project_members:
        member = User.objects.filter(
            id=project_member.user.id).first().to_dict()
        member_data.append(member)
    total_document = Document.objects.filter(project=project).count()
    highlighted_document = Document.objects.filter(
        project=project, is_processed=True).count()
    claims = Claim.objects.filter(project=project)
    total_claim = claims.count()
    claim_type_1 = claims.filter(type=1).count()
    claim_type_2 = claims.filter(type=2).count()
    claim_type_3 = claims.filter(type=3).count()
    sub_type_1 = claims.filter(type=3, sub_type=1).count()
    sub_type_2 = claims.filter(type=3, sub_type=2).count()
    sub_type_3 = claims.filter(type=3, sub_type=3).count()
    sub_type_4 = claims.filter(type=3, sub_type=4).count()
    sub_type_5 = claims.filter(type=3, sub_type=5).count()
    total_labeled = claims.filter(is_labeled=True).count()
    total_skipped_labeled = claims.filter(
        is_labeled=True, label='SKIPPED').count()
    supported_claim = claims.filter(label='SUPPORTED').count()
    refuted_claim = claims.filter(label='REFUTED').count()
    nei_claim = claims.filter(label='NEI').count()
    return {
        'project_id': project.id,
        'project_name': project.name,
        'project_description': project.description,
        'es_id': project.es_id,
        'config': project.to_dict()['config'],
        'project_owner': project.owner.to_dict(),
        'project_member': member_data,
        'document': {
            'total': total_document,
            'processed': highlighted_document
        },
        'claim': {
            'total': total_claim,
            'type_1': claim_type_1,
            'type_2': claim_type_2,
            'type_3': {
                'total': claim_type_3,
                'more_specific': sub_type_1,
                'generalization': sub_type_2,
                'negation': sub_type_3,
                'paraphrasing': sub_type_4,
                'entity_substitution': sub_type_5
            }
        },
        'label': {
            'total_verified_claim': total_labeled - total_skipped_labeled,
            'total_not_verified_claim': total_claim - total_labeled,
            'supported': supported_claim,
            'refuted': refuted_claim,
            'nei': nei_claim
        }
    }
