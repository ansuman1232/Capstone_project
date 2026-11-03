import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import 'dotenv/config';
// Reusing a single Redis connection is more memory efficient
export const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null // Required by BullMQ
};
/*
why not here host:'localhost' in connection?

 Node.js application is running inside a Docker container,
  'localhost' tells it to look for Redis inside that exact same backend container, where it doesn't exist. 
 Changing it to 'redis' matches the service name you defined in your docker-compose.yml
*/

export const videoQueue = new Queue('video-processing', { connection });

/**
 * Utility function to add a job to the queue
 */
export const addVideoJob = async (analysisId, gDriveFileId) => {
 
  return await videoQueue.add('analyze-deepfake', {
    analysisId,
    gDriveFileId
  }, {
    attempts: 3, // Retry up to 3 times if the Python script crashes
    backoff: { type: 'exponential', delay: 2000 }
  });
};