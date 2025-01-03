import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import mime from 'mime-types';
import fileUtils from '../utils/file';
import queries from '../utils/queries';
import db from '../utils/db';

function isValidId(id) {
  try {
    ObjectId(id);
  } catch (err) {
    return false;
  }
  return true;
}

async function setIsPublicFile(req, res, pub) {
  const fileId = req.params.id;
  const authHeader = req.get('X-Token');
  const user = await queries.getUserFromHeader(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  let file = false;
  try {
    const filter = { _id: ObjectId(fileId), userId: user._id }; // Condition to find the document
    const update = { $set: { isPublic: pub } }; // Update operation
    file = await fileUtils.findAndUpdateOne(filter, update);
  } catch (e) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (!file) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.status(200).json(fileUtils.formatFile(file.value));
}

module.exports = (app) => {
  const allowedTypes = ['folder', 'file', 'image'];
  app.post('/files', async (req, res) => {
    const authHeader = req.get('X-Token');
    const storingFolder = process.env.FOLDER_PATH || '/tmp/files_manager';
    const user = await queries.getUserFromHeader(authHeader);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {
      name: filename, type, parentId = 0, isPublic = false, data,
    } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }
    if (parentId !== 0) {
      const parentCheck = await fileUtils.getFileFromId(parentId);
      if (!parentCheck) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentCheck.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    if (type === 'folder') {
      return fileUtils.addFolder(user._id.toString(), filename, parentId, isPublic)
        .then((result) => {
          const ret = { ...result.ops[0] };
          ret.id = ret._id.toString();
          delete ret._id;
          return res.status(201).json(ret);
        });
    }
    const filePath = fileUtils.createFile(storingFolder, uuidv4(), data);
    return fileUtils
      .addFile(user._id.toString(), filename, parentId, isPublic, filePath, type)
      .then((file) => res.status(201).json(file));
  });

  app.get('/files/:id', async (req, res) => {
    const fileId = req.params.id;
    const { userId } = await queries.getUserIdAndKey(req);
    const user = await db.usersCollection.findOne({
      _id: ObjectId(userId),
    });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    if (!isValidId(fileId) || !isValidId(userId)) {
      return res.status(404).send({ error: 'Not found' });
    }
    const result = await fileUtils.getFile({
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });
    if (!result) return res.status(404).send({ error: 'Not found' });
    const file = fileUtils.processFile(result);
    return res.status(200).send(file);
  });

  app.get('/files', async (req, res) => {
    const authHeader = req.get('X-Token');
    const parentId = req.query.parentId || '0';
    let page = Number(req.query.page) || 0;
    if (Number.isNaN(page)) page = 0;
    const user = await queries.getUserFromHeader(authHeader);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (parentId !== '0') {
      const folder = await fileUtils.getFileFromId(parentId);
      if (!folder || folder.type !== 'folder') {
        return res.status(200).send([]);
      }
    }
    let fileList = await fileUtils
      .getAllFilesFromParentIdPaginated(parentId, page);
    fileList = await fileList.toArray();
    const ret = fileList[0].data.map((file) => fileUtils.formatFile(file)) || [];
    return res.status(200).json(ret);
  });

  app.put('/files/:id/publish', async (req, res) => setIsPublicFile(req, res, true));

  app.put('/files/:id/unpublish', async (req, res) => setIsPublicFile(req, res, false));
  app.get('/files/:id/data', async (req, res) => {
    const { id: fileId, size } = req.params;
    const { userId } = await queries.getUserIdAndKey(req);
    const file = await fileUtils.getFileFromId(fileId);
    if (!file) {
      return res.status(404).send({ error: 'Not found' });
    }
    if (file.isPublic === false && (file.userId.toString() !== userId)) {
      return res.status(404).send({ error: 'Not found' });
    }
    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }
    const mimeType = mime.lookup(file.name);
    let path = file.localPath;
    if (size) {
      path = `${path}_${size}`;
    }
    return fs.readFile(path, (err, data) => {
      if (err) {
        return res.status(404).send({ error: 'Not found' });
      }
      res.setHeader('content-type', mimeType);
      return res.status(200).send(data);
    });
  });
};
