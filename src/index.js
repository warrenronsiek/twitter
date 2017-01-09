/**
 * Created by warren on 12/17/16.// const keys = require('./keysTwit');

 */
const aws = require('aws-sdk');
aws.config.update({region: 'us-west-2'});
const logs = new aws.CloudWatchLogs();
const keyData = require('./keysTwit');
const keyBuffer = new Buffer(keyData);
const kmsParams = {CiphertextBlob: keyBuffer};
const kms = new aws.KMS();
const fireHose = new aws.Firehose();
const Twit = require('twit');
const _ = require('lodash');
let logStore = [];

const tweetParams = (tweet) => {
  return {
    DeliveryStreamName: "TweetHose",
    Record: {
      Data: new Buffer(JSON.stringify(tweet))
    }
  }
};

const logParams = (logStore, sequenceToken) => {
  return {
    logEvents: _.sortBy(logStore, obj => obj.timestamp),
    logGroupName: "TwitterLogs",
    logStreamName: "TweetGetterLog",
    sequenceToken: sequenceToken
  }
};

const logErrParams = (err, sequenceToken) => {
  return {
    logEvents: [
      {message: "Error: " + err.message, timestamp: Math.round(Date.now() / 1000)}
    ],
    logGroupName: "TwitterLogs",
    logStreamName: "TweetGetterLog",
    sequenceToken: sequenceToken
  }
};

const sendLogs = () => {
  logs.describeLogStreams({logGroupName: "TwitterLogs"}).promise()
    .then(res => {
      return _.filter(res.logStreams, {logStreamName: 'TweetGetterLog'})[0].uploadSequenceToken
    })
    .then(res => {
      return logs.putLogEvents(logParams(logStore, res))
    })
    .then(logStore = [])
    .catch(err => {
      sendError(err);
    })
};

const sendError = (err) => {
  logs.describeLogStreams({logGroupName: "TwitterLogs"}).promise()
    .then(res => {
      return _.filter(res.logStreams, {logStreamName: 'TweetGetterLog'})[0].uploadSequenceToken
    })
    .then(res => {
      console.log(err);
      return logs.putLogEvents(logErrParams(err, res))
    })
    .catch(err => {
      console.log(err);
      process.exit()
    })
};

const handleNewTweet = (item) => {
  try {
    if (item.lang === 'en') {
      let tweet = {
        id: item.id_str, text: item.text, userId: item.user.id, time: item.timestamp_ms, retweet: item.retweeted,
        response_to: item.in_reply_to_status_id
      };
      fireHose.putRecord(tweetParams(tweet)).promise()
        .then(res => {
          logStore.push(JSON.stringify({message: {id: tweet.id, res}, timestamp: Math.round(Date.now() / 1000)}));
          if (logStore.length >= 1000) {
            return sendLogs();
          }
        })
        .catch(err => sendError(err));
    }
  } catch (err) {
    sendError(err)
  }
};

const stream = kms.decrypt(kmsParams).promise()
  .then(res => {
    return JSON.parse(res.Plaintext.toString())
  })
  .then(res => {
    const T = new Twit(res);
    const stream = T.stream('statuses/sample');
    stream.on('tweet', item => handleNewTweet(item));
    return stream
  })
  .catch(err => {
      sendError(err);
    }
  );




