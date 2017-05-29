#!/bin/bash

# Positon into direcotry with ecosystem file
cd /opt/notredame/apps/ecosystem/

# Stop the application gracefully using pm2
pm2 stop ecosystem.yml
