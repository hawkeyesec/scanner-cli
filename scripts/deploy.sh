#!/bin/bash

echo "Branch is: master.  Building and releasing container."

json_value() {
  KEY=$1
  num=$2
  awk -F"[,:}]" '{for(i=1;i<=NF;i++){if($i~/'$KEY'\042/){print $(i+1)}}}' | tr -d '"' | sed -n ${num}p
}

HE_VERSION=${cat package.json | json_value version 1 | sed -e 's/^ *//' -e 's/ *$//'}
docker pull stono/hawkeye
docker build -t stono/hawkeye . --cache-from stono/hawkeye
docker tag stono/hawkeye:latest stono/hawkeye:"$HE_VERSION"
docker login  -p="$DOCKER_PASSWORD"
echo "$DOCKER_PASSWORD" | docker login -u -u="$DOCKER_USERNAME" --password-stdin
docker push stono/hawkeye:latest
docker push stono/hawkeye:"$HE_VERSION"
