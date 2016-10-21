#!/bin/bash

# Exit when fail
set -e

cd "${0%/*}"

yarn install --pure-lockfile

npm run build

docker build -t odbo-pos:latest .

docker tag odbo-pos:latest 350254269313.dkr.ecr.ap-southeast-1.amazonaws.com/odbo-pos:latest

docker push 350254269313.dkr.ecr.ap-southeast-1.amazonaws.com/odbo-pos:latest
