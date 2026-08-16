FROM python:3.13-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssh-client

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

EXPOSE 5001


ENTRYPOINT ["./entrypoint.sh"]