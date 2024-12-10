import { ObjectId } from 'mongodb';
import db from './db';
import fs from 'fs';
import queueUtils from './queueUtils';

class FileUtils {
  constructor(){}

  addFolder(userId, name, parentId, isPublic) {
    if (parentId !== 0) {
      parentId = ObjectId(parentId);
    }
    return db.filesCollection.insertOne({ userId: ObjectId(userId), name,
      parentId, isPublic,
    type: 'folder' });
  }

  addFile(userId, name, parentId, isPublic, localPath, type) {
    if (parentId !== 0) {
      parentId = ObjectId(parentId);
    }
    return db.filesCollection.insertOne({ userId: ObjectId(userId), name,
      parentId, isPublic,
    type, localPath }).then((result) => {
        const file = result.ops[0];
        if (file.type === 'image') {
          queueUtils.onImageAddition(file._id, file.userId);
        }
        return this.formatFile(file);
      });
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
      return db.filesCollection.findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
    } catch (err) {
      return false;
    }
  }

  getAllFilesFromParentIdPaginated(parentId, page) {
    try {
      let query = {};
      if (parentId !== 0 && parentId !== '0') {
        query = { parentId: ObjectId(parentId) };
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
        { returnOriginal: false });
    } catch (err) {
      return false;
    }
  }

  formatFile(file) {
    let parentId = file.parentId;
    if (parentId !== 0) {
      parentId = parentId.toString();
    }
    return {
      id: file._id.toString(),
      userId: file.userId.toString(),
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId,
    };
  }

  async getFile(query) {
    return db.filesCollection.findOne(query);
  }

  processFile(doc) {
    const file = { id: doc._id.toString(), ...doc };
    delete file.localPath;
    delete file._id;
    return file;
  }
}

module.exports = new FileUtils;
