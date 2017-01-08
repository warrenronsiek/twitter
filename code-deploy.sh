#!/usr/bin/env bash
./node_modules/.bin/webpack
scp -i /Users/warren/Keys/apptab.pem /Users/warren/Desktop/programming_projects/twitter/dist/bundle.js ec2-user@54.191.68.182:/home/ec2-user/
