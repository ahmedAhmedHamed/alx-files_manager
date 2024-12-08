import appControllerPaths from '../controllers/AppController';
import userControllerPaths from '../controllers/UsersController';
import authenticationControllerPaths from '../controllers/AuthController';
import fileControllerPaths from '../controllers/FilesController';

module.exports = (app) => {
  appControllerPaths(app);
  userControllerPaths(app);
  authenticationControllerPaths(app);
  fileControllerPaths(app);
};
