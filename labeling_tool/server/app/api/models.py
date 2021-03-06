from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # Remove non-used fields
    username = None
    last_login = None
    is_staff = None

    password = models.CharField(max_length=100)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    gender = models.SmallIntegerField(default=0)  # 0: Male, 1: Female
    phone = models.CharField(max_length=20, unique=True, default=None)
    is_deleted = models.BooleanField(default=False, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'gender': self.gender,
            'phone': self.phone,
            'is_superuser': self.is_superuser
        }


class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1000)
    owner = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    k = models.FloatField(null=False, default=0.75)
    b1 = models.FloatField(null=False, default=0.5)
    num_sequence_highlight = models.IntegerField(default=4)
    min_table_row_highlight = models.IntegerField(default=5)
    max_table_row_highlight = models.IntegerField(default=50)
    es_id = models.CharField(max_length=100, unique=True, null=False)
    is_deleted = models.BooleanField(default=False, null=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'owner': self.owner.to_dict(),
            'es_id': self.es_id,
            'config': {
                'k': self.k,
                'b1': self.b1,
                'highlight': {
                    'num_sequence_highlight': self.num_sequence_highlight,
                    'min_table_row_highlight': self.min_table_row_highlight,
                    'max_table_row_highlight': self.max_table_row_highlight
                }
            }
        }

    class Meta:
        db_table = "project"


class ProjectMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    project = models.ForeignKey(Project, on_delete=models.DO_NOTHING)

    class Meta:
        db_table = "project_member"


class Document(models.Model):
    doc_id = models.IntegerField()
    project = models.ForeignKey(Project, on_delete=models.DO_NOTHING)
    assigned_to = models.ForeignKey(User, on_delete=models.DO_NOTHING, null=True, default=None, related_name='+')
    is_processed = models.BooleanField(default=False)
    uploader = models.ForeignKey(User, on_delete=models.DO_NOTHING)

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
        db_table = "table_data"


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
    annotated_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='+', null=True, default=None)

    class Meta:
        db_table = "claim"

    def to_dict(self):
        return {
            'project_id': self.project.id,
            'document_id': self.document.id,
            'type': self.type,
            'sub_type': self.sub_type,
            'content': self.content,
            'is_labeled': self.is_labeled,
            'label': self.label,
            'created_by': self.created_by.to_dict(),
            'annotated_by': self.annotated_by.to_dict() if self.annotated_by is not None else None
        }


class Evidence(models.Model):
    claim = models.ForeignKey(Claim, on_delete=models.DO_NOTHING)
    document = models.ForeignKey(Document, on_delete=models.DO_NOTHING, default=None, null=True)
    sentence = models.ForeignKey(Sentence, on_delete=models.DO_NOTHING, default=None, null=True)
    cell = models.ForeignKey(Cell, on_delete=models.DO_NOTHING, default=None, null=True)
    set = models.IntegerField(default=1)

    class Meta:
        db_table = "evidence"

    def get_context(self):
        if self.document is not None:
            return [self.document.id]
        if self.sentence is not None:
            return [self.sentence.document.id, 'sentence_{}'.format(self.sentence.id_in_document)]
        if self.cell is not None:
            table_data = self.cell.table_data
            return [table_data.document.id, 'table_{}'.format(table_data.id_in_document), self.cell.row, self.cell.col]
        return []


class Annotator(models.Model):
    claim = models.ForeignKey(Claim, on_delete=models.DO_NOTHING)
    time = models.FloatField(null=False, default=0)
    value = models.TextField(default="")
    operation = models.TextField(max_length=50)
    document = models.ForeignKey(Document, on_delete=models.DO_NOTHING, default=None, null=True)
    sentence = models.ForeignKey(Sentence, on_delete=models.DO_NOTHING, default=None, null=True)
    cell = models.ForeignKey(Cell, on_delete=models.DO_NOTHING, default=None, null=True)
    set = models.IntegerField(default=1)

    class Meta:
        db_table = "annotator"

    def get_value(self):
        if self.document is not None:
            return [self.document.id]
        if self.sentence is not None:
            return [self.sentence.document.id, 'sentence_{}'.format(self.sentence.id_in_document)]
        if self.cell is not None:
            table_data = self.cell.table_data
            return [table_data.document.id, 'table_{}'.format(table_data.id_in_document), self.cell.row,
                    self.cell.col]
        if self.operation == 'start' or self.operation == 'search':
            return self.value
