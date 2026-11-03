import {Worker} from 'bullmq';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'node:util'
import {drive} from '../config/drive.js';
import {Analysis} from '../models/Analysis.js';
import {connection} from "../Queue/videoQueue.js"
import { pipeline } from 'node:stream/promises';

const execPromise = util.promisify(exec)



// Helper function to download file from Google Drive to local /tmp
const downloadFromDrive = async(fileId,destPath)=>{
    const dest=fs.createWriteStream(destPath);
    /*
 fs.createWriteStream is a built-in Node.js method.
 It prepares a "write stream" pointing to your destination path (destPath), 
essentially creating an empty file on your hard drive ready to receive data.
    */
    const res= await drive.files.get(
        {fileId,alt:"media"},
        {responseType:'stream'}
    )
    /*
    alt: "media": Tells Google Drive that you want to download the actual content of the file, not just its metadata (like the name or file size).
  responseType: 'stream': Instructs the API client to return the file data as a continuous readable stream rather than downloading it all into memory at once.

    */

    // return new Promise((response,reject)=>{
    //     res.data.on('end',()=>{response(destPath)})
    //     .on('error',err=>reject(err))
    //     .pipe(dest)
    // })

    /*
    the problem of above code:-
   That resolves the promise when the download stream ends, not when the file has finished writing to disk. Those aren’t the same moment. The data may still be sitting in a buffer, so the worker can move on and start Python while the file is still incomplete or even empty.
    */

      console.log('Drive content-length:', res.headers['content-length']);

    // pipeline connects Drive's stream (res.data) to a local file writer and
    // resolves only after the file is fully written and closed
    await pipeline(res.data, fs.createWriteStream(destPath));

    const { size } = await fs.promises.stat(destPath);
    console.log('Saved bytes:', size);
    if (size === 0) throw new Error('Downloaded file is empty');

    return destPath;

}

export const videoWorker =new Worker('video-processing', async(job)=>{
    const {analysisId,gDriveFileId}=job.data;
    const localFilePath =path.resolve(process.cwd(),`tmp/${gDriveFileId}.mp4`);
       
    try{
        // 1. Update MongoDB to PROCESSING
        await Analysis.findByIdAndUpdate(analysisId,{status:'PROCESSING'})
       // 2. Download the video from Google Drive to the local worker disk
        await downloadFromDrive(gDriveFileId,localFilePath);
      // 3. Execute the Python Deepfake Detection Script
    // Passes the local file path to your Python environment
       const {stdout,stderr} =await execPromise(`python3 AIModel/worker_cli.py --video "${localFilePath}"`);
      


     
       // Parse the JSON output from your Python script
        const result =JSON.parse(stdout);
        // 4. Update MongoDB with SUCCESS and the metrics
        await Analysis.findByIdAndUpdate(analysisId,{
            status:'SUCCESS',
            prediction:result.prediction, // 'REAL' or 'FAKE'
            confidence:result.confidence,
            metrics:{
                faceNeckCorrelation:result.faceNeckCorrelation,
                compressionType:'c23 Native'
            }

        })

        console.log(`Job ${job.id}: Successfully processed`);
    }
    catch(error){
        console.error(`Job ${job.id}:`,error);
         // Mark as FAILED in MongoDB
        await Analysis.findByIdAndUpdate(analysisId,{
            status:'FAILED',
            error:error.message || 'unknow error'
        })
        throw error;// Let BullMQ handle the retry logic
    }
   finally{
    //5. Always delete from local disk to prevent filling up the server
    if(fs.existsSync(localFilePath)){
        fs.unlinkSync(localFilePath);
    }
     // 6. Delete from Google Drive   
    try{
        await drive.files.delete({fileId:gDriveFileId});
        console.log(`clean up file ${gDriveFileId} from google drive`)

    }catch(cleanupError){
        console.error(`Falied to delete file from google drive:${gDriveFileId}`,cleanupError)
    }

   }
},{connection})



videoWorker.on('active', (job) => {
  console.log(`Worker has started processing job: ${job.id}`);
});



// Handle worker-level errors (e.g., Redis connection drops)
videoWorker.on('error',(err)=>{
    console.error('BullMQ Worker Error:',err);
})