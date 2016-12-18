/**
 * Created by warren on 12/9/16.
 */
import Stream from 'user-stream';
import keys from './keysStream';
const stream = new Stream(keys);

stream.stream();
export default stream.on('data', item => console.log(item));