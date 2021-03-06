# Generated by Django 3.2.8 on 2021-12-03 14:53

from django.conf import settings
import django.contrib.auth.models
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('password', models.CharField(max_length=100)),
                ('full_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=100, unique=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.Group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.Permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Cell',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('row', models.IntegerField()),
                ('col', models.IntegerField()),
                ('is_header', models.BooleanField()),
                ('context', models.TextField()),
            ],
            options={
                'db_table': 'cell',
            },
        ),
        migrations.CreateModel(
            name='Claim',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.SmallIntegerField()),
                ('sub_type', models.SmallIntegerField(default=0)),
                ('content', models.TextField()),
                ('is_labeled', models.BooleanField(default=False)),
                ('label', models.CharField(default='', max_length=20)),
                ('annotated_by', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'claim',
            },
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('doc_id', models.IntegerField()),
                ('is_processed', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'document',
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=1000)),
                ('k', models.FloatField(default=0.75)),
                ('b1', models.FloatField(default=0.5)),
                ('num_sequence_highlight', models.IntegerField(default=4)),
                ('min_table_row_highlight', models.IntegerField(default=5)),
                ('max_table_row_highlight', models.IntegerField(default=50)),
                ('es_id', models.CharField(max_length=100, unique=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'project',
            },
        ),
        migrations.CreateModel(
            name='TableData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('id_in_document', models.IntegerField()),
                ('is_highlighted', models.BooleanField(default=False)),
                ('document', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.document')),
            ],
            options={
                'db_table': 'table_data',
            },
        ),
        migrations.CreateModel(
            name='Sentence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('id_in_document', models.IntegerField()),
                ('context', models.TextField()),
                ('is_highlighted', models.BooleanField(default=False)),
                ('document', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.document')),
            ],
            options={
                'db_table': 'sentence',
            },
        ),
        migrations.CreateModel(
            name='ProjectMember',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.project')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'project_member',
            },
        ),
        migrations.CreateModel(
            name='Evidence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cell', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='api.cell')),
                ('claim', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.claim')),
                ('sentence', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='api.sentence')),
            ],
            options={
                'db_table': 'evidence',
            },
        ),
        migrations.AddField(
            model_name='document',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.project'),
        ),
        migrations.AddField(
            model_name='document',
            name='uploader',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='claim',
            name='document',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.document'),
        ),
        migrations.AddField(
            model_name='claim',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.project'),
        ),
        migrations.AddField(
            model_name='cell',
            name='table_data',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.tabledata'),
        ),
        migrations.CreateModel(
            name='Annotator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('time', models.FloatField(default=0)),
                ('value', models.TextField(default='')),
                ('operation', models.TextField(max_length=50)),
                ('cell', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='api.cell')),
                ('claim', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.claim')),
                ('document', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='api.document')),
                ('sentence', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='api.sentence')),
            ],
            options={
                'db_table': 'annotator',
            },
        ),
    ]
