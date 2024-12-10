import fileQueue from'./utils/fileQueue';
import fileUtils from './utils/file';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';

fileQueue.process(async (job, done) => {
  const fileId = job.data.fileId;
  const userId = job.data.userId;
  if (!fileId) {
    done(new Error('missing fileId'));
  }
  if (!userId) {
    done(new Error('missing userId'));
  }
  const file = await fileUtils.getFileFromIdAndUserId(fileId, userId);
  if (!file) {
    done(new Error('File not found'));
  }
  try {
    const sizes = [100, 250, 500];
    sizes.forEach(size => {
      imageThumbnail(file.localPath, {'width': 100}).then((result) => {
        const filePath = `${file.filePath}_${size}`;
        fs.writeFileSync(filePath, result);
      });
    });
  } catch (e) {}

});
