/**
 * Created by warren on 12/17/16.// const keys = require('./keysTwit');

 */
const aws = require('aws-sdk');
aws.config.update({region: 'us-west-2'});
// aws.config.loadFromPath('../awsKeys.json');
const keyData = require('./keysTwit');
const keyBuffer = new Buffer(keyData);
const kmsParams = {CiphertextBlob: keyBuffer};
const kms = new aws.KMS();
const fireHose = new aws.Firehose();
const Twit = require('twit');
let i = 0;

const params = (tweet) => {
  return {
    DeliveryStreamName: "TweetHose",
    Record: {
      Data: new Buffer(JSON.stringify(tweet))
    }
  }
};

const stream = kms.decrypt(kmsParams).promise()
  .then(res => {
    return JSON.parse(res.Plaintext.toString())
  })
  .then(res => {
    const T = new Twit(res);
    const stream = T.stream('statuses/sample');
    stream.on('tweet', item => {
      if (i >= 100) {
        stream.stop();
        process.exit()
      }
      let tweet = {
        id: item.id, text: item.text, userId: item.user.id, time: item.timestamp_ms, retweet: item.retweeted,
        response_to: item.in_reply_to_status_id
      };
      if (item.lang === 'en') {
        i++;
        fireHose.putRecord(params(tweet), function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(i.toString() + ': ' + JSON.stringify(data))
          }
        })
      }
    });
    return stream
  })
  .catch(err => console.log(err));




