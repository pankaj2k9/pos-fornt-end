#!/bin/bash

# Exit when fail
set -e

cd "${0%/*}"

#yarn install --pure-lockfile
npm install
npm run build

sudo docker build -t odbo-pos:latest .

sudo docker tag odbo-pos:latest azatk/odbo-pos:latest

sudo docker push azatk/odbo-pos:latest
