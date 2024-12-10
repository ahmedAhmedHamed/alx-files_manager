import fileQueue from './fileQueue';

class QueueUtils {
  onImageAddition(userId, fileId) {
    fileQueue.add({ fileId: fileId.toString(),
    userId: userId.toString(), });
  }
}

module.exports = new QueueUtils;
