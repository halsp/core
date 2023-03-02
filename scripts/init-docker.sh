#!/bin/bash

if [ -z $(docker ps -a -q -f "name=^halsp-test-nats$") ];
then
  docker run -itd --name halsp-test-nats -p 6001:4222 nats:2-linux
else
  docker start halsp-test-nats
fi

if [ -z $(docker ps -a -q -f "name=^halsp-test-mqtt$") ];
then
  docker run -itd --name halsp-test-mqtt -p 6002:1883 emqx:5
else
  docker start halsp-test-mqtt
fi

if [ -z $(docker ps -a -q -f "name=^halsp-test-redis$") ];
then
  docker run -itd --name halsp-test-redis -p 6003:6379 redis:6
else
  docker start halsp-test-redis
fi