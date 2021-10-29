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
        return Response({
            'result': 200,
            'project_id': project.id,
            'project_name': project.name,
            'project_description': project.description,
            'project_owner': project.owner.to_dict(),
            'project_member': member_data,
            'claim': {},
            'label': {}
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
            serializer.save(project=project)
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
        highlight = Document.objects.filter(project=project, is_highlighted=False).first()
        if highlight is None:
            return Response({
                'result': 400,
                'detail': 'There is no highlight left'
            })
        else:
            highlight.is_highlighted = True
            highlight.save()
            # TODO: get data from es -> highlight
            return Response({
                'result': 200,
                'es_id': highlight.es_id
            })
