import json
import os
import random

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action, parser_classes
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
from .serializers import UserSerializer, UserLoginSerializer, ProjectSerializer, ProjectMemberSerializer, \
    ClaimSerializer
from django.conf import settings
from .utils import *
from rest_framework.parsers import MultiPartParser, FileUploadParser
from elasticsearch import Elasticsearch, helpers
from django.db import transaction
import requests


# Create your views here.


class UserRegisterView(APIView):
    @staticmethod
    def post(request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data['password'] = make_password(
                serializer.validated_data['password'])
            serializer.save()

            return JsonResponse({
                'message': 'Register successfully!',
                'result': 201
            }, status=status.HTTP_201_CREATED)

        else:
            return JsonResponse({
                'message': 'This email has already exist!',
                'result': 400,
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
                    'result': 201,
                    'email': str(user),
                    'user_id': int(user.id),
                    'refresh_token': str(refresh),
                    'access_token': str(refresh.access_token),
                    'access_expires': int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                    'refresh_expires': int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
                }
                return Response(data, status=status.HTTP_200_OK)

            return Response({
                'message': 'Email or password is incorrect!',
                'result': 400
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': serializer.errors,
            'result': 400
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    @staticmethod
    def post():
        return Response({
            'message': 'Logout successfully!',
            'result': 200
        }, status=status.HTTP_200_OK)


class SearchMemberView(APIView):
    @staticmethod
    def get(request):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        users = User.objects.filter(full_name=request.data['full_name'])
        data = []
        for u in users:
            data.append(u.to_dict())
        return Response({
            'result': 200,
            'users': data
        })


class UserViewSet(APIView):
    @staticmethod
    def get(request):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        users = User.objects.all()
        data = []
        for u in users:
            data.append(u.to_dict())
        return Response({
            'result': 200,
            'users': data
        })


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
                'message': "Tải lên dữ liệu thành công",
                'logs': resp
            }, status.HTTP_201_CREATED)
        except Exception as e:
            print(e)
            return Response({
                'message': "Tải lên dữ liệu thất bại",
                'logs': str(e)
            }, status.HTTP_503_SERVICE_UNAVAILABLE)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    @auth
    @parser_classes([MultiPartParser])
    @transaction.atomic
    def create(self, request):
        user = User.objects.filter(email=request.user).first()
        serializer = self.serializer_class(data=request.data)
        project = self.queryset.filter(es_id=request.data['es_id']).first()

        if project is not None:
            return Response({
                'errors': 'es_id already exist'
            }, status.HTTP_400_BAD_REQUEST)

        try:
            print("Received file ", request.FILES)
            uploaded_file = request.FILES['file']
            filename = '/tmp/' + request.data['es_id'] + '.json'
            with open(filename, 'wb+') as new_file:
                for chunk in uploaded_file.chunks():
                    new_file.write(chunk)

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
            json_file = open(filename, 'r')
            data = json.load(json_file)
            data_length = len(data)
            os.remove(filename)
            print('data length: ' + str(data_length))
            print('Indexing {}'.format(request.data['es_id']))

            resp = helpers.bulk(
                client,
                data,
                index=request.data['es_id'],
            )

            print("helpers.bulk() RESPONSE:", json.dumps(resp, indent=4))
            if (resp[0] == data_length):
                # Index successfully
                if serializer.is_valid():
                    project = serializer.save(owner=user)
                    ProjectMember.objects.create(user=user, project=project)
                    documents = []
                    for doc in data:
                        document = Document.objects.filter(project=project, doc_id=doc['_id']).first()
                        if document is None:
                            documents.append(Document(project=project, doc_id=doc['_id'], uploader=user))
                    Document.objects.bulk_create(documents)
                    return Response(get_project_info(project.id), status.HTTP_201_CREATED)
                else:
                    return Response({
                        'errors': serializer.errors
                    }, status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'result': 503,
                'message': "Tải lên dữ liệu thất bại",
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
        user = User.objects.filter(email=request.user).first()
        project_members = ProjectMember.objects.filter(user=user)
        projects = []
        for project_member in project_members:
            projects.append(project_member.project.to_dict())
        return Response({
            'count': len(projects),
            'projects': projects
        }, 200)

    @action(methods=['post'], detail=False)
    @is_project_member
    @parser_classes([MultiPartParser])
    @transaction.atomic
    def upload_file(self, request):
        project = self.queryset.filter(pk=request.data['project_id']).first()

        try:
            print("Received file ", request.FILES)
            uploaded_file = request.FILES['file']
            filename = '/tmp/' + project.es_id + '.json'
            with open(filename, 'wb+') as new_file:
                for chunk in uploaded_file.chunks():
                    new_file.write(chunk)

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
            json_file = open(filename, 'r')
            data = json.load(json_file)
            data_length = len(data)
            os.remove(filename)
            print('data length: ' + str(data_length))
            print('Indexing {}'.format(project.es_id))

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
                'result': 503,
                'message': "Tải lên dữ liệu thất bại",
                'logs': str(e)
            }, status.HTTP_503_SERVICE_UNAVAILABLE)


class ProjectMemberViewSet(viewsets.ModelViewSet):
    queryset = ProjectMember.objects.all()
    serializer_class = ProjectMemberSerializer

    @is_project_owner
    def create(self, request):
        project = Project.objects.filter(id=request.data['project_id']).first()
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            project_members = self.queryset.filter(project=project)
            return Response({
                'project_id': project.id,
                'project_member': set(project_member.user.id for project_member in project_members)
            }, 201)
        else:
            return Response({
                'error': serializer.errors
            }, 400)

    @action(methods=['delete'], detail=False)
    @is_project_owner
    def delete(self, request):
        project = Project.objects.filter(id=request.data['project_id']).first()
        member = User.objects.filter(id=request.data['user_id']).first()
        if member is None:
            return Response({
                'error': 'User not found'
            }, 404)
        project_member = self.queryset.filter(
            user=member, project=project).first()
        if project_member is None:
            return Response({
                'error': 'User not in project'
            }, 400)
        if member == project.owner:
            return Response({
                'error': 'Can not remove project owner from project'
            }, 400)
        self.queryset.filter(user=member, project=project).delete()
        return Response({}, 201)


class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer

    @action(detail=False, methods=['post'])
    @is_project_member
    def highlight(self, request, pk=None):
        project = Project.objects.filter(id=request.data['project_id']).first()
        query_set = Document.objects.filter(project=project, is_processed=False)
        if query_set.count() == 0:
            return Response({
                'errors': 'There is no document left'
            }, status.HTTP_400_BAD_REQUEST)
        document = query_set[random.randint(0, query_set.count() - 1)]
        try:
            # Get Config and Document Data
            path = 'http://{}/{}/_doc/{}'.format(settings.ELASTICSEARCH_SERVER, project.es_id, document.doc_id)
            document_data = requests.get(path).json()
            order = document_data['_source']['order']
            seq_num = project.num_sequence_highlight
            min_row = project.min_table_row_highlight
            max_row = project.max_table_row_highlight

            # Check if highlight table or sentences
            document_has_table = False
            tables = []
            for item in order:
                if item[0:5] == 'table':
                    table = document_data['_source'][item]
                    if min_row <= len(table) <= max_row:
                        document_has_table = True
                        tables.append(item)
            get_table = False
            if document_has_table and min_row <= max_row and max_row > 0:
                get_table = random.choice([True, False])

            # Get Highlight List
            highlight = []
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
                        table_data = document_data[item]
                        for row in range(0, len(table_data) - 1):
                            row_data = table_data[row]
                            for column in range(0, len(row_data) - 1):
                                cell = row_data[column]
                                cells.append(Cell(
                                    row=row,
                                    column=column,
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
            Sentence.objects.bulk_create(sentences)
            Cell.objects.bulk_create(cells)

            # Return data
            document.is_processed = True
            document.save()
            return Response({
                'es_id': document.doc_id,
                'highlight': highlight,
                'document_id': document.id,
                'document_data': document_data['_source']
            }, status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'errors': str(e)
            }, status.HTTP_400_BAD_REQUEST)

    @is_project_member
    def create(self, request):
        user = User.objects.filter(email=request.user).first()
        project = Project.objects.filter(id=request.data['project_id']).first()
        document = Document.objects.filter(id=request.data['document_id'], is_processed=True, project=project).first()
        if document is None:
            return Response({
                'errors': 'Document is not exist'
            }, status.HTTP_404_NOT_FOUND)
        claim_1 = Claim.objects.create(project=project, document=document,
                                       type=1, content=request.data['claim_1'], created_by=user)
        claim_2 = Claim.objects.create(project=project, document=document,
                                       type=2, content=request.data['claim_2'], created_by=user)
        claim_3 = Claim.objects.create(project=project, document=document,
                                       type=3, sub_type=request.data['sub_type'],
                                       content=request.data['claim_3'], created_by=user)
        return Response({
            'claim_1': claim_1.to_dict(),
            'claim_2': claim_2.to_dict(),
            'claim_3': claim_3.to_dict()
        }, status.HTTP_201_CREATED)


class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.all()

    @action(detail=False, methods=["post"])
    @is_project_member
    def get_claim(self, request, pk=None):
        project = Project.objects.filter(id=request.data['project_id']).first()
        queryset = Claim.objects.filter(project=project, is_labeled=False)
        if queryset.count() == 0:
            return Response({
                'errors': 'There is no claim left'
            }, status.HTTP_400_BAD_REQUEST)
        claim = queryset[random.randint(0, queryset.count() - 1)]
        claim.is_labeled = True
        claim.label = 'SKIPPED'
        claim.save()
        return Response({
            'claim_id': claim.id,
            'claim': claim.content
        }, status.HTTP_200_OK)

    @is_project_member
    @transaction.atomic
    def create(self, request):
        user = User.objects.filter(email=request.user).first()
        project = Project.objects.filter(id=request.data['project_id']).first()
        claim = Claim.objects.filter(
            id=request.data['claim_id'], project=project).first()
        if claim is None:
            return Response({
                'errors': 'Claim is not exist in project'
            }, status.HTTP_404_NOT_FOUND)

        # Update claim label with evidences and annotators
        claim.label = request.data['label']
        claim.annotated_by = user
        claim.is_labeled = True
        claim.save()
        try:
            evidence_datas = request.data['evidence']
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
                    Evidence.objects.create(claim=claim, sentence=sentence)
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
                    Evidence.objects.create(claim=claim, cell=cell)

            annotate_data = request.data['annotator_operation']
            for annotation in annotate_data:
                operation = annotation['operation']
                time = annotation['time']
                value = annotation['value']
                if operation == "start" or operation == "search":
                    Annotator.objects.create(claim=claim, time=time, operation=operation, value=value[0])
                else:
                    doc_id = value[0]
                    document = Document.objects.filter(project=project, doc_id=doc_id).first()
                    if document is None:
                        claim.is_labeled = False
                        claim.save()
                        return Response({
                            'errors': 'doc_id is not exist in ' + str(evidence)
                        }, status.HTTP_400_BAD_REQUEST)
                    if len(value) == 0:
                        Annotator.objects.create(claim=claim, time=time, operation=operation, document=document)
                    elif len(value) == 1:
                        sentence_id = evidence[1]
                        sentence = Sentence.objects.filter(document=document, id_in_document=sentence_id).first()
                        if sentence is None:
                            sentence = Sentence.objects.create(document=document,
                                                               id_in_document=sentence_id,
                                                               context='{}_sentence_{}'.format(doc_id, sentence_id),
                                                               is_highlighted=False)
                        Annotator.objects.create(claim=claim, time=time, operation=operation, sentence=sentence)
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
                        Annotator.objects.create(claim=claim, time=time, operation=operation, cell=cell)

            return Response({}, status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "errors": str(e)
            }, status.HTTP_400_BAD_REQUEST)


def get_project_info(project_id):
    project = Project.objects.filter(id=project_id).first()
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
