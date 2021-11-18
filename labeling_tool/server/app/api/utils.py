import functools

from .models import *
from rest_framework.response import Response


def is_user_in_project(user_id, project_id):
    user = User.objects.filter(id=user_id).first()
    if user is None:
        return {
            'result': False,
            'detail': 'User is not exist'
        }
    project = Project.objects.filter(id=project_id).first()
    if project is None:
        return {
            'result': False,
            'detail': 'Project is not exist'
        }
    project_member = ProjectMember.objects.filter(user=user, project=project)
    if project_member is None:
        return {
            'result': False,
            'detail': 'User is not in Project',
        }
    else:
        return {
            'result': True
        }


def auth(func):

    @functools.wraps(func)
    def execute(view_set, request, *args, **kwargs):
        user = User.objects.filter(email=request.user).first()
        if user is None:
            return Response({}, 401)
        return func(view_set, request, *args, **kwargs)

    return execute


def is_project_member(func):

    @functools.wraps(func)
    @auth
    def execute(view_set, request, *args, **kwargs):
        user = User.objects.filter(email=request.user).first()
        project = Project.objects.filter(pk=request.data['project_id']).first()
        if project is None:
            return Response({'error': 'Project is not exist.'}, 404)
        project_member = ProjectMember.objects.filter(user=user, project=project).first()
        if project_member is None:
            return Response({'error': 'User is not a project member.'}, 403)
        return func(view_set, request, *args, **kwargs)

    return execute


def is_project_owner(func):

    @functools.wraps(func)
    @is_project_member
    def execute(view_set, request, *args, **kwargs):
        user = User.objects.filter(email=request.user).first()
        project = Project.objects.filter(pk=request.data['project_id']).first()
        if project.owner != user:
            return Response({'error': 'This action is for project owner only.'}, 403)
        return func(view_set, request, *args, **kwargs)

    return execute
