from django.urls import path
from django.urls.conf import include
from .views import ProjectViewSet, UserRegisterView, UserLoginView, ProjectMemberViewSet, SearchMemberView, \
    DocumentViewSet, ClaimViewSet
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'project', ProjectViewSet)
router.register(r'project_member', ProjectMemberViewSet)
router.register(r'project_document', DocumentViewSet)
router.register(r'claim_generation', ClaimViewSet)
urlpatterns = [
    path('auth/register', UserRegisterView.as_view()),
    path('auth/login', UserLoginView.as_view()),
    path('auth/logout', UserLoginView.as_view()),
    path('user/search', SearchMemberView.as_view()),
    path('', include(router.urls)),
]
