import db from './db';
import redisDB from './redis';
import { ObjectId } from 'mongodb';

class Queries {
  constructor() {}

  async getUserFromHeader(authHeader) {
    if (!authHeader) {
      return false;
    }
    const id = await redisDB.get(`auth_${authHeader}`);
    if (!id) {
      return false;
    }
    const user = await this.getUserFromId(id);
    if (!user) {
      return false;
    }
    return user;
  }

  async getUserFromId(id) {
    try {
      return db.usersCollection.findOne({ _id: ObjectId(id) });
    } catch (err) {
      return false;
    }
  }

  async getUserIdAndKey(request) {
    const ret = { userId: null, key: null };
    const token = request.header('X-Token');
    if (!token) return ret;
    ret.key = `auth_${token}`;
    ret.userId = await redisDB.get(ret.key);
    return ret;
  }

}

module.exports = new Queries();
