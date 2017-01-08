/**
 * Created by warren on 12/17/16.
 */
const keys = require('./keysTwit');
const aws = require('aws-sdk');
aws.config.update({region: 'us-west-2'});
// aws.config.loadFromPath('../awsKeys.json');
const Twit = require('twit');
const T = new Twit(keys);
const fireHose = new aws.Firehose();
const stream = T.stream('statuses/sample');

const params = (tweet) => {
  return {
    DeliveryStreamName: "TweetHose",
    Record: {
      Data: new Buffer(JSON.stringify(tweet))
    }
  }
};
let i = 0;

stream.on('tweet', item => {
  if (i >= 1000000) {
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