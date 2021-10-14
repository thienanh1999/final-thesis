#!/bin/sh

echo "Waiting for MySQL..."

while ! nc -z db 3306 ; do
    sleep 1
done

python manage.py runserver 0.0.0.0:8000

exec "$@"