#!/usr/bin/env bash
ssh -i /Users/warren/Keys/apptab.pem ec2-user@54.191.68.182
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 6.7.0
nohup node bundle.js > /home/ec2-user/log.txt &