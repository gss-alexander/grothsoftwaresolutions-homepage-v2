#!/bin/bash

source .env
npm run build
ssh "$TARGET_SERVER" 'rm -rf /var/www/html/*'
scp -r ./dist/* "$TARGET_SERVER":/var/www/html