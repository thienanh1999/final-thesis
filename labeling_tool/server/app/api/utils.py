import functools

from .models import *
from rest_framework.response import Response
from rest_framework import status


def is_user_in_project(user_id, project_id):
    user = User.objects.filter(id=user_id, is_deleted=False).first()
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
        user = User.objects.filter(email=request.user, is_deleted=False).first()
        if user is None:
            return Response({}, status.HTTP_401_UNAUTHORIZED)
        return func(view_set, request, *args, **kwargs)

    return execute


def is_project_member(func):

    @functools.wraps(func)
    @auth
    def execute(view_set, request, *args, **kwargs):
        user = User.objects.filter(email=request.user).first()
        project = Project.objects.filter(pk=request.data['project_id']).first()
        if project is None:
            return Response({'error': 'Project is not exist.'}, status.HTTP_404_NOT_FOUND)
        project_member = ProjectMember.objects.filter(user=user, project=project).first()
        if project_member is None:
            return Response({'error': 'User is not a project member.'}, status.HTTP_403_FORBIDDEN)
        return func(view_set, request, *args, **kwargs)

    return execute


def is_project_owner(func):

    @functools.wraps(func)
    @is_project_member
    def execute(view_set, request, *args, **kwargs):
        user = User.objects.filter(email=request.user).first()
        project = Project.objects.filter(pk=request.data['project_id']).first()
        if project.owner != user:
            return Response({'errors': 'This action is for project owner only.'}, status.HTTP_403_FORBIDDEN)
        return func(view_set, request, *args, **kwargs)

    return execute


def is_admin(func):

    @functools.wraps(func)
    @auth
    def execute(view_set, request, *args, **kwargs):
        user = User.objects.filter(email=request.user).first()
        if not user.is_superuser:
            return Response({'errors': 'This site is for admin only'}, status.HTTP_403_FORBIDDEN)
        return func(view_set, request, *args, **kwargs)

    return execute


def update_model(obj, data, fields):
    for field in fields:
        if data.get(field) is not None:
            setattr(obj, field, data[field])
    obj.save()
