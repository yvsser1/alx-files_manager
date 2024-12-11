import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  /**
   * Get status of Redis and MongoDB connections
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Status of Redis and MongoDB connections
   */
  static getStatus(req, res) {
    return res.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive()
    });
  }

  /**
   * Get statistics of users and files in the database
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Number of users and files
   */
  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();

    return res.status(200).json({ users, files });
  }
}

export default AppController;