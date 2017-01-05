#!/usr/local/bin/node

const cli = require('commander');
const aws = require('aws-sdk');
const fs = require('fs');
const template = JSON.stringify(JSON.parse(fs.readFileSync('./cloudformation.template', 'utf8')));
const awsKeys = {};

aws.config.loadFromPath('./awsKeys.json');

cli
  .version('0.0.1')
  .usage('[options]')
  .option('-u, --updateStack', 'update stack')
  .option('-c, --createStack', 'create stack')
  .option('-d, --deleteStack', 'delete stack')
  .parse(process.argv);

const cloudformation = new aws.CloudFormation({apiVersion: '2010-05-15'});

if (cli.createStack) {
  createStack();
} else if (cli.updateStack){
  updateStack();
} else if (cli.deleteStack) {
  deleteStack();
} else {
  updateStack()
}


function createStack() {
  let params = {
    StackName: 'twitter',
    Capabilities: ['CAPABILITY_IAM'],
    TemplateBody: template
  };
  cloudformation.createStack(params).promise()
    .catch(err => console.log(err))
}

function updateStack() {
  let params = {
    StackName: 'twitter',
    Capabilities: ['CAPABILITY_IAM'],
    TemplateBody: template
  };
  cloudformation.updateStack(params).promise()
    .catch(err => console.log(err))
}

function deleteStack() {
  let params = {
    StackName: 'twitter'
  };
  cloudformation.deleteStack(params).promise()
    .catch(err => console.log(err))
}