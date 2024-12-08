import db from './db';
import fs from 'fs';
import {ObjectId} from 'mongodb';

class FileUtils {
  constructor(){}

  addFolder(userId, name, parentId, isPublic) {
    return db.filesCollection.insertOne({ userId, name, parentId, isPublic,
    type: 'folder' });
  }

  addFile(userId, name, parentId, isPublic, localPath, type, data) {
    return db.filesCollection.insertOne({ userId, name, parentId, isPublic,
    type, localPath, data });
  }

  createFile(storingFolder, filename, base64Data) {
    if (!fs.existsSync(storingFolder)) {
    fs.mkdirSync(storingFolder, { recursive: true });
    }
    const filePath = `${storingFolder}/${filename}`;
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  getFileFromId(id) {
    try {
      return db.filesCollection.findOne({ _id: ObjectId(id) });
    } catch (err) {
      return false;
    }
  }
}

module.exports = new FileUtils;
