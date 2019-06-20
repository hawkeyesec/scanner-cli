#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

git checkout "$(git describe --abbrev=0)"

VERSION=$(cat package.json | awk -F"[,:}]" '{for(i=1;i<=NF;i++){if($i~/version\042/){print $(i+1)}}}' | tr -d '"' | sed -n 1p | sed -e 's/^ *//' -e 's/ *$//')
DATE=$(date +%Y-%m-%d)

TAG_LATEST="hawkeyesec/scanner-cli:latest"
TAG_DATE="hawkeyesec/scanner-cli:$DATE"
TAG_VERSION_DATE="hawkeyesec/scanner-cli:$VERSION-$DATE"

docker build . -t "$TAG_LATEST" -t "$TAG_DATE" -t "$TAG_VERSION_DATE"
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push "$TAG_LATEST"
docker push "$TAG_DATE"
docker push "$TAG_VERSION_DATE"
