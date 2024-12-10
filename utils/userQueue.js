import Bull from 'bull';

const userQueue = new Bull('userQueue', {
    redis: {
        port: 6379,
        host: '127.0.0.1',
    },
});

module.exports = userQueue;
