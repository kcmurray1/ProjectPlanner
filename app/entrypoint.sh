#!/bin/bash

# give some time for things to load
sleep 10

exec uvicorn main:app --host 0.0.0.0 --port 5001