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

}

module.exports = new Queries();
