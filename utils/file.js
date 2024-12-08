import db from './db';

class FileUtils {
  constructor(){}

  addFolder(userId, name, parentId, isPublic) {
    return db.filesCollection.insertOne({ userId, name, parentId, isPublic,
    type: 'folder' });
  }
}

module.exports = new FileUtils;
