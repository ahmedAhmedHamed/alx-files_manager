import appControllerPaths from '../controllers/AppController';
import userControllerPaths from '../controllers/UsersController';
module.exports = (app) => {
  appControllerPaths(app);
  userControllerPaths(app);
};
