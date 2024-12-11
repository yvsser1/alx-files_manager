import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  /**
   * Authenticate user and generate token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} Authentication token or error response
   */
  static async getConnect(req, res) {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode Base64 credentials
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    // Validate credentials
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Hash password for comparison
    const hashedPassword = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex');

    // Find user in database
    const user = await dbClient.users.findOne({ 
      email, 
      password: hashedPassword 
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate token
    const token = uuidv4();
    const redisKey = `auth_${token}`;

    // Store user ID in Redis for 24 hours
    await redisClient.set(redisKey, user._id.toString(), 24 * 60 * 60);

    return res.status(200).json({ token });
  }

  /**
   * Disconnect user and remove token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} No content or error response
   */
  static async getDisconnect(req, res) {
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

    // Remove token from Redis
    await redisClient.del(redisKey);

    return res.status(204).end();
  }
}

export default AuthController;