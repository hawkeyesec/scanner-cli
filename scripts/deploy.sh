#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

VERSION=$(cat package.json | awk -F"[,:}]" '{for(i=1;i<=NF;i++){if($i~/version\042/){print $(i+1)}}}' | tr -d '"' | sed -n 1p | sed -e 's/^ *//' -e 's/ *$//')
echo "Building and releasing container version $VERSION ..."

docker pull stono/hawkeye
docker build -t stono/hawkeye . --cache-from stono/hawkeye
docker tag stono/hawkeye:latest stono/hawkeye:"$VERSION"
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push stono/hawkeye:latest
docker push stono/hawkeye:"$VERSION"
