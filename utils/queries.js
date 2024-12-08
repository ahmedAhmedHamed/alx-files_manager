import db from './db';
import redisDB from './redis';

class Queries {
  constructor() {}

  async getUserFromHeader(authHeader) {
    if (!authHeader) {
      return false;
    }
    const userEmail = await redisDB.get(`auth_${authHeader}`);
    if (!userEmail) {
      return false;
    }
    const user = await db.getUser(userEmail);
    if (!user) {
      return false;
    }
    return user;
  }

}

module.exports = new Queries();
