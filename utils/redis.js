import { createClient } from 'redis';

class RedisClient {
  constructor() {
    // Create Redis client
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
    });

    // Handle connection errors
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // Connect to Redis
    this.client.connect().catch(console.error);
  }

  /**
   * Check if Redis connection is alive
   * @returns {boolean} Connection status
   */
  isAlive() {
    return this.client.isOpen;
  }

  /**
   * Get value from Redis by key
   * @param {string} key - The key to retrieve
   * @returns {Promise<string|null>} The value associated with the key
   */
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis Get Error:', error);
      return null;
    }
  }

  /**
   * Set a key-value pair in Redis with expiration
   * @param {string} key - The key to set
   * @param {string} value - The value to store
   * @param {number} duration - Expiration time in seconds
   */
  async set(key, value, duration) {
    try {
      await this.client.setEx(key, duration, value);
    } catch (error) {
      console.error('Redis Set Error:', error);
    }
  }

  /**
   * Delete a key from Redis
   * @param {string} key - The key to delete
   */
  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis Delete Error:', error);
    }
  }
}

// Create and export a single instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
