from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # Remove non-used fields
    username = None
    last_login = None
    is_staff = None
    is_superuser = None

    password = models.CharField(max_length=100)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class Project(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=1000)
    owner = models.ForeignKey(User, on_delete=models.DO_NOTHING)

    class Meta:
        db_table = "project"


class ProjectMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    project = models.ForeignKey(Project, on_delete=models.DO_NOTHING)

    class Meta:
        db_table = "project_member"


class Document(models.Model):
    es_id = models.CharField(max_length=255)
    project = models.ForeignKey(Project, on_delete=models.DO_NOTHING)
    is_highlighted = models.BooleanField(default=False)

    class Meta:
        db_table = "document"


class Claim(models.Model):
    project = models.ForeignKey(Project, on_delete=models.DO_NOTHING)
    type = models.SmallIntegerField()
    sub_type = models.SmallIntegerField()
    content = models.TextField()
    is_labeled = models.BooleanField()
    label = models.CharField(max_length=20)

    class Meta:
        db_table = "claim"


class Evidence(models.Model):
    claim = models.ForeignKey(Claim, on_delete=models.DO_NOTHING)
    content = models.TextField()
    context = models.TextField()

    class Meta:
        db_table = "evidence"


class Annotator(models.Model):
    claim = models.ForeignKey(Claim, on_delete=models.DO_NOTHING)
    annotators = models.TextField()

    class Meta:
        db_table = "annotator"
