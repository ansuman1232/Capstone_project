import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import 'dotenv/config';

export const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null 
};


export const videoQueue = new Queue('video-processing', { connection });


export const addVideoJob = async (analysisId, gDriveFileId) => {
 
  return await videoQueue.add('analyze-deepfake', {
    analysisId,
    gDriveFileId
  }, {
    attempts: 3, 
    backoff: { type: 'exponential', delay: 2000 }
  });
};