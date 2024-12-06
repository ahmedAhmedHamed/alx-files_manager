import { createClient } from 'redis';
import util from "util";


class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnected = true;
    this.client.on('error', (error)=> {
      this.isConnected = false;
      console.log(error);
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async get(key) {
    const getAsync = util.promisify(this.client.get).bind(this.client);
    const ret = getAsync(key);
    ret.catch(console.error);
    return ret;
  }

  async set(key, value, duration) {
    const setAsync = util.promisify(this.client.set).bind(this.client);
    const ret = setAsync(key, value, 'EX', duration);
    ret.catch(console.error);
    return ret;
  }

  async del(key) {
    const delAsync = util.promisify(this.client.del).bind(this.client);
    const ret = delAsync(key);
    ret.catch(console.error);
    return ret;
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;

