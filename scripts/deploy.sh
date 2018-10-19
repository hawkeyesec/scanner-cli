#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

VERSION=$(cat package.json | awk -F"[,:}]" '{for(i=1;i<=NF;i++){if($i~/version\042/){print $(i+1)}}}' | tr -d '"' | sed -n 1p | sed -e 's/^ *//' -e 's/ *$//')
echo "Building and releasing container version $VERSION ..."

docker build . -t hawkeyesec/scanner-cli:latest -t hawkeyesec/scanner-cli:"$VERSION"
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push hawkeyesec/scanner-cli:"$VERSION"
docker push hawkeyesec/scanner-cli:latest
