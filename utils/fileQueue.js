import Bull from 'bull';

const fileQueue = new Bull('fileQueue', {
    redis: {
        port: 6379,
        host: '127.0.0.1',
    },
});

module.exports = fileQueue;
