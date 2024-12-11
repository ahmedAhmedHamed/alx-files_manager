import db from '../utils/db';
import queries from '../utils/queries';
import queueUtils from '../utils/queueUtils';

module.exports = (app) => {
  app.post('/users', async (req, res) => {
    const { email, password } = req.body;
    db.createUser(email, password).then((id) => {
      queueUtils.onUserSignup(id.toString());
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
    const ret = { id: user._id, ...user };
    delete ret._id;
    delete ret.password;
    return res.status(200).json(ret);
  });
};
