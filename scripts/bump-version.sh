#!/bin/bash

cd "$(dirname "$0")/.." || exit 1

# read version from package.json and trim leading/trailing whitespace
VERSION="v$(cat package.json | awk -F"[,:}]" '{for(i=1;i<=NF;i++){if($i~/version\042/){print $(i+1)}}}' | tr -d '"' | sed -n 1p | sed -e 's/^ *//' -e 's/ *$//')"
echo "Tagging: $VERSION"
git tag "$VERSION"
