import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  // Previous postNew method remains the same

  /**
   * Retrieve user information based on token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} User information or error response
   */
  static async getMe(req, res) {
    // Retrieve token from header
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;

    // Check if token exists in Redis
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find user in database
    const user = await dbClient.users.findOne({ 
      _id: dbClient.ObjectId(userId) 
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return user information
    return res.status(200).json({ 
      id: user._id, 
      email: user.email 
    });
  }
}

export default UsersController;
