#!/bin/bash

if [[ -z $(docker ps -q -f "name=^ipare-test-nats$") ]];then
  docker run -itd --name ipare-test-nats -p 6001:4222 nats:2-linux
fi

if [[ -z $(docker ps -q -f "name=^ipare-test-mqtt$") ]];then
  docker run -itd --name ipare-test-mqtt -p 6002:1883 emqx:5
fi

if [[ -z $(docker ps -q -f "name=^ipare-test-redis$") ]];then
  docker run -itd --name ipare-test-redis -p 6003:6379 redis:6
fi