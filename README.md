Twitter Pipeline
================

This project contains everything you need to build a high capacity
twitter to S3 data pipeline at extremely low cost. If you have any
questions please feel free to create an issue.

Installation
------------
 1. Have an AWS account. Create an ec2 keypair and save it. Create a twitter developer account and get your twitter app credentials.
 2. run `npm install` in this directory.
 3. Create a vpc with a public subnet.
 4. Go through the cloudformation.template and replace the following:
    1. Line 10: "KeyName": "name of your keypair",
    2. Line 22: {"Fn::ImportValue"...: the name of your vpc security group
    3. Line 26: {"Fn::ImportValue"...: the name of your subnet
    4. Line 385: "BucketName": "name of your new bucket"
 5. Create a JSON file that contains your AWS key, secret key, and the region us-west-2:
    * {"accessKeyId": "your access key", "secretAccessKey": "your secret key", "region": "us-west-2"}
 6. Change line 8 in cloud-deploy.js to read the aforementioned json credentials.
 7. run `./cloud-deploy.js -c` to create the stack.
 8. the stack will create a kms key that you will now use to encrypt your twitter credentials:
    1. Log in to your aws console and get the Key ID of the recently created kms key
    2. Create a json string of your twitter keys. E.g
        * '{"consumer_key": "...", "consumer_secret": "...", "access_token": "...", "access_token_secret":  "..."}'
    3. Fire up your node repl and run the following:
    ```
    const aws = require('aws-sdk');
    aws.config.update({region: 'us-west-2'});
    aws.config.loadFromPath('path to your aws keys json file');
    const fs = require('fs');
    const kms = new aws.KMS();
    kms.encrypt({KeyId: "your key ID", Plaintext: "json twitter key"},
        function (err, data) {
          if (err) {
            console.log(err)
          } else {
            fs.writeFile('/path/to/this/project/src/keysTwit.json',
                JSON.stringify(data.CiphertextBlob.toJSON()))
          }
    });
    ```
 9. Get the public IP associated with the EC2 instance created by the stack and create a file called code-deploy.sh with the following code in it:
     ```
     #!/usr/bin/env bash
     ./node_modules/.bin/webpack
     scp -i /path/to/key/yourKey.pem /path/to/twitter/project/dist/bundle.js ec2-user@:<your public ip>/home/ec2-user/
     ```
10. Run `./code-deploy.sh`
11. SSH into your ec2 instance, update programs, install node, and run the bundle.
    ```
    ssh -i "yourpemkey.pem" ec2-user@<your public ip>
    sudo yum update
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
    . ~/.nvm/nvm.sh
    nvm install 6.7.0
    nohup node bundle.js > /home/ec2-user/log.txt &
    logout
    ```
12. Done! You should see tweets appearing in S3 pretty soon.

TODO
----
Currently the EC2 instance does not log to cloudwatch. I will be implementing an SQS queue to enable this functionality.

