const MongoClient = require('mongodb').MongoClient;
import crypto from 'crypto';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `'mongodb://${host}:${port}'`
    this.client = new MongoClient(url);
    this.isConnected = false;
    this.client.connect((err) => {
      if (err !== null) return this.isConnected = false;
      else {
        console.log("Connected successfully to server");
        this.db = this.client.db(database);
        this.isConnected = true;
      }
    });
  }

  hashString(input) {
    return crypto.createHash('sha1').update(input).digest('hex');
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

  async getUser(email) {
    const usersCollection = this.db.collection('users');
    return usersCollection.findOne({ email });
  }

  async getUserFull(email, password) {
    const usersCollection = this.db.collection('users');
    const hashedPassword = this.hashString(password);
    try {
      return usersCollection.findOne({ email, password: hashedPassword });
    } catch (err) {
      return false
    }
  }

  createUser(email, password) {
    return new Promise(async (resolve, reject) => {
      if (!email) { reject('Missing email'); }
      if (!password) { reject('Missing password'); }
      const user = await this.getUser(email);
      if (user) { reject('Already exist'); }
      const id = await this.db.collection('users').insertOne({
        email,
        password: this.hashString(password)
      });
      resolve(id.insertedId);
    });
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
