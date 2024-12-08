import fileUtils from '../utils/file';
import queries from "../utils/queries";
module.exports = (app) => {
  const allowedTypes = ['folder', 'file', 'image'];
  app.post('/files', async (req, res) => {
    const authHeader = req.get('X-Token');
    const user = await queries.getUserFromHeader(authHeader);
    if (!user) {
      return res.status(401).json({'error': 'Unauthorized'});
    }
    const body = req.body;
    const filename = body.name;
    const type = body.type;
    const parentId = body.parentId || 0;
    const isPublic = body.isPublic || false;
    const data = body.data;
    if (!filename) {
      return res.status(400).json({'error': 'Missing name'});
    }
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({'error': 'Missing type'});
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({'error': 'Missing data'});
    }

    if (type === 'folder') {
      fileUtils.addFolder(user._id.toString(), filename, parentId, isPublic).then((result) => {
        const ret = { ...result.ops[0] };
        ret.id = ret._id.toString();
        delete ret._id;
        res.status(201).json(ret)
      });
    }

  });
}
