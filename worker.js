import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';

// Create file queue
const fileQueue = new Queue('fileQueue');

// Process the file queue
fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  // Validate job data
  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  // Find the file in the database
  const file = await dbClient.files.findOne({ 
    _id: dbClient.ObjectId(fileId),
    userId: dbClient.ObjectId(userId)
  });

  if (!file) {
    throw new Error('File not found');
  }

  // Check if the file is an image
  if (file.type !== 'image') {
    return;
  }

  const thumbnailSizes = [500, 250, 100];

  // Generate thumbnails
  for (const width of thumbnailSizes) {
    try {
      // Generate thumbnail
      const thumbnailBuffer = await imageThumbnail(file.localPath, { width });

      // Create thumbnail path (appending size to original filename)
      const thumbnailPath = `${file.localPath}_${width}`;

      // Write thumbnail to disk
      fs.writeFileSync(thumbnailPath, thumbnailBuffer);
    } catch (error) {
      console.error(`Error generating thumbnail ${width}:`, error);
    }
  }
});

export default fileQueue;