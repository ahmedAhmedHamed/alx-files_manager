import db from '../utils/db';
module.exports = (app) => {
  app.post('/users', async (req, res) => {
    const body = req.body;
    const email = body.email;
    const password = body.password;
    db.createUser(email, password).then((id) => {
      res.status(201).json({
        email,
        id
      });
    }).catch((error) => {
      res.status(400).json({
        'error': error
      });
    });
  });
}
