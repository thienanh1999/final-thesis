# Generated by Django 3.2.8 on 2021-10-29 17:57

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
            name='Claim',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.SmallIntegerField()),
                ('sub_type', models.SmallIntegerField(default=0)),
                ('content', models.TextField()),
                ('is_labeled', models.BooleanField(default=False)),
                ('label', models.CharField(default='', max_length=20)),
            ],
            options={
                'db_table': 'claim',
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.CharField(max_length=1000)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'project',
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
                ('content', models.TextField()),
                ('context', models.TextField()),
                ('claim', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.claim')),
            ],
            options={
                'db_table': 'evidence',
            },
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('es_id', models.CharField(max_length=255)),
                ('is_highlighted', models.BooleanField(default=False)),
                ('orders', models.TextField()),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.project')),
            ],
            options={
                'db_table': 'document',
            },
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
        migrations.CreateModel(
            name='Annotator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('annotators', models.TextField()),
                ('claim', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.claim')),
            ],
            options={
                'db_table': 'annotator',
            },
        ),
    ]
