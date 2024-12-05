const MongoClient = require('mongodb').MongoClient;

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `'mongodb://${host}:${port}'`
    this.client = new MongoClient(url);
    this.isConnected = false;
    this.client.connect((err) => {
      console.log("Connected successfully to server");
      if (err !== null) return this.isConnected = false;
      else {
        this.db = this.client.db(database);
        this.isConnected = true;
      }
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    const usersCollection = this.db.collection('users');
    return usersCollection.countDocuments();
  }

  async nbFiles() {
    const filesCollection = this.db.collection('files');
    return filesCollection.countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
