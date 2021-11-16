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

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name
        }


class Project(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=1000)
    owner = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    k = models.FloatField()
    b1 = models.FloatField()

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'owner': self.owner.to_dict()
        }

    class Meta:
        db_table = "project"


class ProjectMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    project = models.ForeignKey(Project, on_delete=models.DO_NOTHING)

    class Meta:
        db_table = "project_member"


class Document(models.Model):
    es_id = models.IntegerField()
    project = models.ForeignKey(Project, on_delete=models.DO_NOTHING)
    is_processed = models.BooleanField(default=False)

    class Meta:
        db_table = "document"


class Sentence(models.Model):
    id_in_document = models.IntegerField()
    document = models.ForeignKey(Document, on_delete=models.DO_NOTHING)
    context = models.TextField()
    is_highlighted = models.BooleanField(default=False)

    class Meta:
        db_table = "sentence"


class TableData(models.Model):
    id_in_document = models.IntegerField()
    document = models.ForeignKey(Document, on_delete=models.DO_NOTHING)
    is_highlighted = models.BooleanField(default=False)

    class Meta:
        db_table = "tableData"


class Cell(models.Model):
    row = models.IntegerField()
    col = models.IntegerField()
    is_header = models.BooleanField()
    table_data = models.ForeignKey(TableData, on_delete=models.DO_NOTHING)
    context = models.TextField()

    class Meta:
        db_table = "cell"


class Claim(models.Model):
    project = models.ForeignKey(Project, on_delete=models.DO_NOTHING)
    document = models.ForeignKey(Document, on_delete=models.DO_NOTHING)
    type = models.SmallIntegerField()
    sub_type = models.SmallIntegerField(default=0)
    content = models.TextField()
    is_labeled = models.BooleanField(default=False)
    label = models.CharField(max_length=20, default='')
    created_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='+')
    annotated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='+')

    class Meta:
        db_table = "claim"


class Evidence(models.Model):
    claim = models.ForeignKey(Claim, on_delete=models.DO_NOTHING)
    sentence = models.ForeignKey(Sentence, on_delete=models.DO_NOTHING, default=None)
    cell = models.ForeignKey(Cell, on_delete=models.DO_NOTHING, default=None)

    class Meta:
        db_table = "evidence"


class Annotator(models.Model):
    claim = models.ForeignKey(Claim, on_delete=models.DO_NOTHING)
    operation = models.TextField(max_length=50)
    document = models.ForeignKey(Document, on_delete=models.DO_NOTHING, default=None)
    sentence = models.ForeignKey(Sentence, on_delete=models.DO_NOTHING, default=None)
    cell = models.ForeignKey(Cell, on_delete=models.DO_NOTHING, default=None)

    class Meta:
        db_table = "annotator"
