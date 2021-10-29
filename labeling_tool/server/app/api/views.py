from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
from .serializers import UserSerializer, UserLoginSerializer, ProjectSerializer, ProjectMemberSerializer, \
    DocumentSerializer, ClaimSerializer
from django.conf import settings
from .utils import *


# Create your views here.
class UserRegisterView(APIView):
    @staticmethod
    def post(request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.validated_data['password'] = make_password(serializer.validated_data['password'])
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


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def create(self, request):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            project = serializer.save(owner=user)
            ProjectMember.objects.create(user=user, project=project)
            return Response({
                'result': 201,
                'project_id': project.id,
                'project_name': project.name,
                'project_description': project.description,
                'project_owner': user.to_dict(),
                'project_member': [user.to_dict()]
            })
        else:
            return Response({
                'result': 400,
                'errors': serializer.errors
            })

    def retrieve(self, request, pk=None):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        project = get_object_or_404(self.queryset, pk=pk)
        project_members = ProjectMember.objects.filter(project=project)
        member_data = []
        for project_member in project_members:
            member = User.objects.filter(id=project_member.user.id).first().to_dict()
            member_data.append(member)
        total_document = Document.objects.filter(project=project).count()
        highlighted_document = Document.objects.filter(project=project, is_highlighted=True).count()
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
        total_skipped_labeled = claims.filter(is_labeled=True, label='SKIPPED').count()
        supported_claim = claims.filter(label='SUPPORTED').count()
        refuted_claim = claims.filter(label='REFUTED').count()
        nei_claim = claims.filter(label='NEI').count()
        return Response({
            'result': 200,
            'project_id': project.id,
            'project_name': project.name,
            'project_description': project.description,
            'project_owner': project.owner.to_dict(),
            'project_member': member_data,
            'document': {
                'total': total_document,
                'highlighted': highlighted_document
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
                'total_verified_claim': total_labeled-total_skipped_labeled,
                'total_not_verified_claim': total_claim-total_labeled,
                'supported': supported_claim,
                'refuted': refuted_claim,
                'nei': nei_claim
            }
        })

    def list(self, request):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        project_members = ProjectMember.objects.filter(user=user)
        projects = []
        for project_member in project_members:
            projects.append(project_member.project.to_dict())
        return Response({
            'result': 200,
            'count': len(projects),
            'projects': projects
        })


class ProjectMemberViewSet(viewsets.ModelViewSet):
    queryset = ProjectMember.objects.all()
    serializer_class = ProjectMemberSerializer

    def create(self, request):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        project = Project.objects.filter(id=request.data['project_id']).first()
        if project.owner != user:
            return Response({
                'result': 403
            })
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            project_members = self.queryset.filter(project=project)
            return Response({
                'result': 201,
                'project_id': project.id,
                'project_member': set(project_member.user.id for project_member in project_members)
            })
        else:
            return Response({
                'result': 400,
                'error': serializer.errors
            })

    @action(methods=['delete'], detail=False)
    def delete(self, request):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        project = Project.objects.filter(id=request.data['project_id']).first()
        if project is None:
            return Response({
                'result': 404,
                'detail': 'Project not found'
            })
        if project.owner != user:
            return Response({
                'result': 403
            })
        member = User.objects.filter(id=request.data['user_id']).first()
        if member is None:
            return Response({
                'result': 404,
                'detail': 'User not found'
            })
        project_member = self.queryset.filter(user=member, project=project).first()
        if project_member is None:
            return Response({
                'result': 400,
                'detail': 'User not in project'
            })
        return Response({
            'result': 204
        })


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def create(self, request):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        project = Project.objects.filter(id=request.data['project_id']).first()
        if project is None:
            return Response({
                'result': 404,
                'detail': 'Project not found'
            })
        member = ProjectMember.objects.filter(user=user).first()
        if member is None:
            return Response({
                'result': 403
            })
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(project=project, is_highlighted=False)
            return Response({
                'result': 201
            })
        else:
            return Response({
                'result': 400
            })


class ClaimViewSet(viewsets.ModelViewSet):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer

    @action(detail=False, methods=['get'])
    def highlight(self, request, pk=None):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        check_project_member = is_user_in_project(user.id, request.data['project_id'])
        if not check_project_member['result']:
            return Response({
                'result': 404,
                'detail': check_project_member['detail']
            })
        project = Project.objects.filter(id=request.data['project_id']).first()
        highlight = Document.objects.filter(project=project).first()
        if highlight is None:
            return Response({
                'result': 400,
                'detail': 'There is no highlight left'
            })
        else:
            highlight.is_highlighted = True
            highlight.save()
            # TODO: get highlight list
            return Response({
                'result': 200,
                'es_id': highlight.es_id,
                'highlight': ["sentence0", "sentence1", "sentence2", "sentence3"],
                'document_id': highlight.id
            })

    def create(self, request):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        check_project_member = is_user_in_project(user.id, request.data['project_id'])
        if not check_project_member['result']:
            return Response({
                'result': 404,
                'detail': check_project_member['detail']
            })
        project = Project.objects.filter(id=request.data['project_id']).first()
        document = Document.objects.filter(id=request.data['document_id']).first()
        if document is None:
            return Response({
                'result': 404,
                'detail': 'Document is not exist'
            })
        Claim.objects.create(project=project, document=document, type=1, content=request.data['claim_1'])
        Claim.objects.create(project=project, document=document, type=2, content=request.data['claim_2'])
        Claim.objects.create(project=project, document=document, type=3, sub_type=request.data['sub_type'],
                             content=request.data['claim_3'])
        return Response({
            'result': 201
        })


class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.all()

    @action(detail=False, methods=["get"])
    def get_claim(self, request, pk=None):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        check_project_member = is_user_in_project(user.id, request.data['project_id'])
        if not check_project_member['result']:
            return Response({
                'result': 404,
                'detail': check_project_member['detail']
            })
        project = Project.objects.filter(id=request.data['project_id']).first()
        claim = Claim.objects.filter(project=project, is_labeled=False).first()
        if claim is None:
            return Response({
                'result': 400,
                'detail': 'There is no claim left'
            })
        claim.is_labeled = True
        claim.label = 'SKIPPED'
        claim.save()
        return Response({
            'result': 200,
            'claim_id': claim.id,
            'claim': claim.content
        })

    def create(self, request):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({
                'result': 401
            })
        check_project_member = is_user_in_project(user.id, request.data['project_id'])
        if not check_project_member['result']:
            return Response({
                'result': 404,
                'detail': check_project_member['detail']
            })
        project = Project.objects.filter(id=request.data['project_id']).first()
        claim = Claim.objects.filter(id=request.data['claim_id'], project=project).first()
        if claim is None:
            return Response({
                'result': 404,
                'claim': 'Claim is not exist in project'
            })

        # Update claim label with evidences and annotators
        claim.label = request.data['label']
        claim.save()
        evidences = request.data['evidence']
        for evidence in evidences:
            Evidence.objects.create(claim=claim, content=evidence['content'], context=evidence['context'])
        Annotator.objects.create(claim=claim, annotators=request.data['annotator_operation'])

        return Response({
            'result': 201
        })
