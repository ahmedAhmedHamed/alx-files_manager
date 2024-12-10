import fileQueue from './fileQueue';

class QueueUtils {
  onImageAddition(fileId, userId) {
    fileQueue.add({ fileId: fileId.toString(),
    userId: userId.toString(), });
  }
}

module.exports = new QueueUtils;
