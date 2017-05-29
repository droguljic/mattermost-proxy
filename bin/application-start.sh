#!/bin/bash

# Positon into direcotry with ecosystem file
cd /opt/notredame/apps/ecosystem/

# Start the application using pm2, ecosystem file is used to provide appropriate environemnt
pm2 start ecosystem.yml --update-env
