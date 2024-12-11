import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    // Get MongoDB connection parameters from environment variables
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';

    // Construct MongoDB connection URL
    const url = `mongodb://${host}:${port}`;

    // Create MongoDB client
    this.client = new MongoClient(url, { 
      useUnifiedTopology: true,
      useNewUrlParser: true 
    });

    // Connect to MongoDB
    this.client.connect()
      .then(() => {
        // Select the database
        this.db = this.client.db(database);
      })
      .catch((error) => {
        console.error('MongoDB Connection Error:', error);
      });
  }

  /**
   * Check if MongoDB connection is alive
   * @returns {boolean} Connection status
   */
  isAlive() {
    return this.client && this.client.topology && this.client.topology.isConnected();
  }

  /**
   * Get number of users in the database
   * @returns {Promise<number>} Number of users
   */
  async nbUsers() {
    try {
      return await this.db.collection('users').countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      return 0;
    }
  }

  /**
   * Get number of files in the database
   * @returns {Promise<number>} Number of files
   */
  async nbFiles() {
    try {
      return await this.db.collection('files').countDocuments();
    } catch (error) {
      console.error('Error counting files:', error);
      return 0;
    }
  }

  /**
   * Get a reference to a specific collection
   * @param {string} collectionName - Name of the collection
   * @returns {Object} MongoDB collection
   */
  get users() {
    return this.db.collection('users');
  }

  /**
   * Get a reference to files collection
   * @returns {Object} Files collection
   */
  get files() {
    return this.db.collection('files');
  }

  /**
   * Expose ObjectId for easier database operations
   */
  get ObjectId() {
    return MongoClient.ObjectId;
  }
}

// Create and export a single instance of DBClient
const dbClient = new DBClient();
export default dbClient;