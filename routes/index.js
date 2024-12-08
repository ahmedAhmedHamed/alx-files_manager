import appControllerPaths from '../controllers/AppController';
import userControllerPaths from '../controllers/UsersController';
import authenticationControllerPaths from '../controllers/AuthController';

module.exports = (app) => {
  appControllerPaths(app);
  userControllerPaths(app);
  authenticationControllerPaths(app);
};
