#!/usr/bin/env sh

# Stop the application using pm2, use delete to pickup ecosystem.yml changes, if any, during startup
pm2 delete ecosystem.yml
