#!/bin/bash

if [[ -z $(docker ps -a -q -f "name=^ipare-test-nats$") ]];
then
  docker run -itd --name ipare-test-nats -p 6001:4222 nats:2-linux
else
  docker start ipare-test-nats
fi

if [[ -z $(docker ps -a -q -f "name=^ipare-test-mqtt$") ]];
then
  docker run -itd --name ipare-test-mqtt -p 6002:1883 emqx:5
else
  docker start ipare-test-mqtt
fi

if [[ -z $(docker ps -a -q -f "name=^ipare-test-redis$") ]];
then
  docker run -itd --name ipare-test-redis -p 6003:6379 redis:6
else
  docker start ipare-test-redis
fi