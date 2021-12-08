from django.urls import path
from django.urls.conf import include
from .views import ProjectViewSet, UserRegisterView, UserLoginView, ProjectMemberViewSet, SearchMemberView, \
    ClaimViewSet, EvidenceViewSet, UserViewSet,\
    FileUploadView, ChangePasswordView, UpdateUserProfileView
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'project', ProjectViewSet)
router.register(r'project_member', ProjectMemberViewSet)
router.register(r'claim_generation', ClaimViewSet)
router.register(r'claim_verification', EvidenceViewSet)
urlpatterns = [
    path('auth/register', UserRegisterView.as_view()),
    path('auth/change_password', ChangePasswordView.as_view()),
    path('auth/update_profile', UpdateUserProfileView.as_view()),
    path('auth/login', UserLoginView.as_view()),
    path('auth/logout', UserLoginView.as_view()),
    path('user/search', SearchMemberView.as_view()),
    path('user', UserViewSet.as_view()),
    path('upload', FileUploadView.as_view()),
    path('', include(router.urls)),
]
