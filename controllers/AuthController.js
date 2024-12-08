import { v4 as uuidv4 } from 'uuid';
import db from '../utils/db';
import redisDB from '../utils/redis';
import queries from '../utils/queries';

module.exports = (app) => {
  app.get('/connect', async (req, res) => {
    const authheader = req.headers.authorization;
    if (!authheader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    let email = false;
    let password = false;
    try {
      /* eslint-disable new-cap */
      [email, password] = new Buffer.from(authheader.split(' ')[1],
        'base64').toString().split(':');
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await db.getUserFull(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sessionToken = uuidv4();
    await redisDB.set(`auth_${sessionToken}`, email, 24 * 60 * 60);
    return res.status(200).json(
      { token: sessionToken },
    );
  });

  app.get('/disconnect', async (req, res) => {
    const authHeader = req.get('X-Token');
    const user = await queries.getUserFromHeader(authHeader);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisDB.del(`auth_ + ${authHeader}`);
    return res.status(204).send();
  });
};
