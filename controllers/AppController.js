import db from '../utils/db';
import redisDB from '../utils/redis';
module.exports = (app) => {
  app.get('/status', (req, res) => {
    res.status(200).json({
      'redis': redisDB.isAlive(),
      'db': db.isAlive()
    });
  });
  app.get('/stats', async (req, res) => {
    res.status(200).json({
     'users': await db.nbUsers(),
     'files': await db.nbFiles()
    });
  });
}
