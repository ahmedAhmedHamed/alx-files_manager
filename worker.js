import fileQueue from'./utils/fileQueue';
import userQueue from './utils/userQueue';
import fileUtils from './utils/file';
import queries from './utils/queries';
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
    return done(new Error('File not found'));
  }
  try {
    const sizes = [100, 250, 500];
    sizes.forEach(size => {
      imageThumbnail(file.localPath, {'width': size}).then((result) => {
        const filePath = `${file.localPath}_${size}`;
        fs.writeFile(filePath, result, ()=>{});
      });
    });
    return done();
  } catch (e) {}

});

userQueue.process(async (job, done) => {
  const userId = job.data.userId;
  if (!userId) {
    done(new Error('missing userId'));
  }
  const user = await queries.getUserFromId(userId);
  if (!user) {
    done(new Error('User not found'));
  }
  console.log(`Welcome ${user.email}!`)
});
