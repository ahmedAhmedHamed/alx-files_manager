import { MongoClient } from 'mongodb';
import crypto from 'crypto';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `'mongodb://${host}:${port}'`;
    this.client = new MongoClient(url);
    this.isConnected = false;
    this.client.connect((err) => {
      if (err !== null) {
        this.isConnected = false;
        return null;
      }
      console.log('Connected successfully to server');
      this.db = this.client.db(database);
      this.isConnected = true;
      this.usersCollection = this.db.collection('users');
      this.filesCollection = this.db.collection('files');
      return null;
    });
  }

  static hashString(input) {
    return crypto.createHash('sha1').update(input).digest('hex');
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    return this.usersCollection.countDocuments();
  }

  async nbFiles() {
    return this.filesCollection.countDocuments();
  }

  async getUser(email) {
    return this.usersCollection.findOne({ email });
  }

  async getUserFull(email, password) {
    const hashedPassword = DBClient.hashString(password);
    try {
      return this.usersCollection.findOne({ email, password: hashedPassword });
    } catch (err) {
      return false;
    }
  }

  createUser(email, password) {
    return new Promise((resolve, reject) => {
      if (!email) {
        reject(new Error('Missing email'));
        return null;
      }
      if (!password) {
        reject(new Error('Missing password'));
        return null;
      }
      this.getUser(email).then((user) => {
        if (user) {
          reject(new Error('Already exist'));
          return null;
        }
        this.db.collection('users').insertOne({
          email,
          password: DBClient.hashString(password),
        }).then((id) => { resolve(id.insertedId); });
        return null;
      });
      return null;
    });
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
