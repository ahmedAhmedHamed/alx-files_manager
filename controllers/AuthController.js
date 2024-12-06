import db from '../utils/db';
import redisDB from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';
module.exports = (app) => {
  app.get('/connect', async (req, res) => {
    const authheader = req.headers.authorization;
    if (!authheader) {
      return res.status(401).json({'error': 'Unauthorized'});
    }
    let email = false;
    let password = false;
    try {
      const auth = new Buffer.from(authheader.split(' ')[1],
        'base64').toString().split(':');
      email = auth[0];
      password = auth[1];
    } catch (e) {
      return res.status(401).json({'error': 'Unauthorized'});
    }
    if (!email || !password) {
      return res.status(401).json({'error': 'Unauthorized'});
    }
    const user = await db.getUserFull(email, password)
    if (!user) {
      return res.status(401).json({'error': 'Unauthorized'});
    }

    const sessionToken =  uuidv4();
    await redisDB.set('auth_' + sessionToken, email, 24 * 60 * 60)
    return res.status(200).json(
      {'token': sessionToken}
    );
  });
}
