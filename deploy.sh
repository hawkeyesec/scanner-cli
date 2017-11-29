#!/bin/bash
if [ "$TRAVIS_BRANCH" == "master" ]; then
  echo "Branch is: master.  Building and releasing container."
  docker pull stono/hawkeye
  docker build --build-arg HE_VERSION=$HE_VERSION -t stono/hawkeye . --cache-from stono/hawkeye
  docker tag stono/hawkeye:latest stono/hawkeye:$HE_VERSION
  docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
  docker push stono/hawkeye:latest
  docker push stono/hawkeye:$HE_VERSION
else
  echo "Branch is: $TRAVIS_BRANCH.  Nothing to do."
fi
