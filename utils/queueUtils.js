import fileQueue from './fileQueue';
import userQueue from './userQueue';

class QueueUtils {
  onImageAddition(fileId, userId) {
    fileQueue.add({ fileId: fileId.toString(),
    userId: userId.toString(), });
  }

  onUserSignup(userId) {
    userQueue.add({ userId: userId.toString() });
  }
}

module.exports = new QueueUtils;
