import db from './db';
import fs from 'fs';
import {ObjectId} from 'mongodb';

class FileUtils {
  constructor(){}

  addFolder(userId, name, parentId, isPublic) {
    return db.filesCollection.insertOne({ userId, name, parentId, isPublic,
    type: 'folder' });
  }

  addFile(userId, name, parentId, isPublic, localPath, type) {
    return db.filesCollection.insertOne({ userId, name, parentId, isPublic,
    type, localPath });
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

  getFileFromIdAndUserId(fileId, userId) {
    try {
      return db.filesCollection.findOne({ _id: ObjectId(fileId), userId });
    } catch (err) {
      return false;
    }
  }

  getAllFilesFromParentIdPaginated(parentId, page) {
    try {
      let query = {};
      if (parentId !== 0 && parentId !== '0') {
        query = { parentId };
      }
      return db.filesCollection.aggregate([
        {
          $match: query
        },
        {
          $facet: {
            data: [{ $skip: (page) * 20 }, { $limit: 20 }],
          },
        },
      ]);
    } catch (err) {
      return false;
    }
  }

  findAndUpdateOne(filter, update) {
    try {
      return db.filesCollection.findOneAndUpdate(filter, update,
        {returnDocument: 'after'});
    } catch (err) {
      return false;
    }
  }

  formatFile(file) {
    const ret = {id: file._id.toString(), ...file};
    delete ret.file;
    delete ret.localPath;
    return ret;
  }
}

module.exports = new FileUtils;
