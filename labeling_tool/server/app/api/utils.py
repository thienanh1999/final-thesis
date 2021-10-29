from .models import *


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
