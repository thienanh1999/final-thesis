from rest_framework import serializers
from .models import *


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'phone', 'gender']
        extra_kwargs = {'password': {'write_only': True}}


class UserLoginSerializer(serializers.Serializer):
    def update(self, instance, validated_data):
        pass

    def create(self, validated_data):
        pass

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = (
            'name',
            'description',
            'k',
            'b1',
            'num_sequence_highlight',
            'min_table_row_highlight',
            'max_table_row_highlight',
            'es_id',
        )


class ProjectMemberSerializer:

    def __init__(self, data):
        self.data = data

    def is_valid(self):
        self.errors = {}
        user = User.objects.filter(id=self.data['user_id']).first()
        if user is None:
            self.errors['user_id'] = 'User is not exist.'
            return False
        project = Project.objects.filter(id=self.data['project_id']).first()
        if project is None:
            self.errors['project_id'] = 'Project is not exist.'
            return False
        project_member = ProjectMember.objects.filter(
            user=user, project=project).first()
        if project_member is not None:
            self.errors['user_id'] = 'User already in the project.'
            return False
        self.user = user
        self.project = project
        return True

    def save(self):
        project_member = ProjectMember(user=self.user, project=self.project)
        project_member.save()


class ClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = ['type', 'sub_type', 'content']
