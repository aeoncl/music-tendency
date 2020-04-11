FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN apt-get update &&\
    apt-get install -y ffmpeg