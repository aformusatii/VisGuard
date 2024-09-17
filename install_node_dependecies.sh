#!/bin/bash

docker run -it --rm --name visguard -v "$(pwd)":/usr/src/visguard -w /usr/src/visguard node:22 npm install