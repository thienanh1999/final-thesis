#!/bin/sh

echo "Waiting for MySQL..."

while ! nc -z db 3306 ; do
    sleep 1
done

echo "MySQL is ready, starting development server..."

python manage.py makemigrations
python manage.py migrate
gunicorn labeling_tool.wsgi:application -w 12 -b 0.0.0.0:8000

exec "$@"