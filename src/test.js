/**
 * Created by warren on 12/9/16.
 */

import keys from './keysTwit';
const Twit =  require('twit');
const T = new Twit(keys);

const stream = T.stream('statuses/sample');

export default stream.on('tweet', item => console.log(item));