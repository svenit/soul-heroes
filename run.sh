#!/bin/bash
dockerContainer=solo-dungeon
dockerImage=solo-dungeon
dockerPort=8120
localPort=8120

echo "Delete old container"
docker rm -f "$dockerContainer"

echo "Delete old image"
docker rmi -f "${dockerImage}"

echo "Build image"
docker build -t ${dockerImage} .

echo "Run container"
docker container run --name ${dockerContainer} -p ${localPort}:${dockerPort} ${dockerImage}

echo "Delete old images"
docker rmi $(docker images --filter "dangling=true" -q --no-trunc)

echo "Successfully"