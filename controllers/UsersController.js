import db from '../utils/db';
import queries from '../utils/queries';

module.exports = (app) => {
  app.post('/users', async (req, res) => {
    const { email, password } = req.body;
    db.createUser(email, password).then((id) => {
      res.status(201).json({
        email,
        id,
      });
    }).catch((error) => {
      res.status(400).json({
        error: error.message,
      });
    });
  });
  app.get('/users/me', async (req, res) => {
    const authHeader = req.get('X-Token');
    const user = await queries.getUserFromHeader(authHeader);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ id: user._id, email: user.email  });
  });
};
