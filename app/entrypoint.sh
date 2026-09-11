#!/bin/bash

# give some time for things to load
sleep 10
set -e

export PYTHONPATH=/usr/src/app/app:$PYTHONPATH

echo "Running database migrations..."
alembic upgrade head

exec uvicorn app.main:app --host 0.0.0.0 --port 5001