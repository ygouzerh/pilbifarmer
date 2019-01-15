#!/usr/bin/env bash

cd front/

ng build

cp dist/PilbiApp/* ../back/public/
