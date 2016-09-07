#!/bin/bash

# Exit when fail
set -e

if [ -z "$1" ]; then
  echo "Please specify app version"
  exit 1
fi

npm install

npm run build

docker build -t pos-app:"$1" .

docker tag pos-app:"$1" 350254269313.dkr.ecr.us-east-1.amazonaws.com/pos-app:"$1"

docker push 350254269313.dkr.ecr.us-east-1.amazonaws.com/pos-app:"$1"
