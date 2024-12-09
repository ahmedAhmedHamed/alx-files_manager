import { v4 as uuidv4 } from 'uuid';
import fileUtils from '../utils/file';
import queries from '../utils/queries';

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
      .addFile(user._id.toString(), filename, parentId, isPublic, filePath, type, data)
      .then((result) => {
        const ret = { ...result.ops[0] };
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.localPath;
        return res.status(201).json(ret);
      });
  });
};
