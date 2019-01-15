#!/usr/bin/env bash

# Build the angular project and put it on the real app.
cd front/

ng build

cp dist/PilbiApp/* ../back/public/
