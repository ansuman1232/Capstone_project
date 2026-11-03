import multer from'multer';
import path from 'path';
import fs from 'fs';
import {drive} from '../config/drive.js';
import { Analysis } from '../models/Analysis.js';
import { addVideoJob } from '../Queue/videoQueue.js';

//1. Ensure local /tmp directory exists for Multer
const tmpDir= path.resolve(process.cwd(),'tmp');
if(!fs.existsSync(tmpDir)){
    fs.mkdirSync(tmpDir,{recursive:true})
    /*
       { recursive: true } inside fs.mkdirSync() does two important things:
        1. Creates parent folders automatically: If any of the parent directories in the path do not exist yet,
         Node.js will create them automatically instead of throwing an error. For example, if you try to create tmp/uploads/images and the tmp folder doesn't exist, 
         it will create tmp, then uploads, and finally images.
        2. Prevents "Folder Already Exists" errors: If the target directory already exists, Node.js will simply ignore the command and move on, 
         rather than throwing an EEXIST error
    */
}

// 2. Configure Multer for File Uploads
const storage =multer.diskStorage({
    destination:(req,file,cb)=>cb(null,tmpDir),
    filename:(req,file,cb)=>{
        const uniqueSuffix=`${Date.now()}-${Math.round(Math.random()*1e9)}`
        cb(null,`${uniqueSuffix}${path.extname(file.originalname)}`)
    }
})

// File filter to allow only video formats
const fileFilter =(req,file,cb)=>{
    if(file.mimetype.startsWith('video/')){
        cb(null,true);
    }
    else{
        cb(new Error('only video files (mp4,AVI,MOV,etc.) are allowed!'),false)
    }
}

const upload=multer({
    storage,
    fileFilter,
    limits:{fileSize:100*1024*1024}// 100MB limit
})


const uploadVideo= async (req,res)=>{
  
    if(!req.file) return res.status(400).json({error:"please upload video"})
   
    const tempFilePath=req.file.path;

    try{
        // A.create record in MongoDB to generate the unique analysisId(_id)
        const newAnalysis=await Analysis.create({
          userId:req.body.userId,
          filename:req.file.originalname,
          status:'PENDING'
        })
        const analysisId= newAnalysis._id;
        // B. Stream file to Google Drive (Zero RAM buffer bloat)
        const driveResponse =await drive.files.create({
            requestBody:{
                name:`${analysisId}_${req.file.originalname}`,
                parents:[process.env.GDRIVE_FOLDER_ID]// Isolated folder ID
                //to get folder id just in browser go to that folder in google drive in url that id will be displayed after 'folder/' 
            },
            media:{
                mimeType:req.file.mimeType,
                body:fs.createReadStream(tempFilePath)
            },
              //ADD THIS PARAMETER TO ALLOW UPLOADS TO EXTERNAL/SHARED FOLDERS
    supportsAllDrives: true 

        })

        const gDriveFileId= driveResponse.data.id;
        // C. Dispatch job to BullMQ
        await addVideoJob(analysisId,gDriveFileId);

        //D. Return response
        res.status(202).json({
            success:true,
            message:'Video uploaded and analysis queued successfully',
            analysisId,
            status:newAnalysis.status
        })
    } catch(error){
        console.error('Upload pipeline Error: ',error);
        res.status(500).json({error:error.message || 'Failed to process the video'})
    }
    finally{
        // E. Defensive Cleanup: Always delete Multer's local file after streaming to Drive
        if(fs.existsSync(tempFilePath)){
            fs.unlinkSync(tempFilePath)
        }
    }

    }



 const getAnalysis= async (req,res)=>{
    const {userId}=req.params;
    const analysis= await Analysis.find({userId})

    res.json({analysis})
 }




    export {upload,uploadVideo,getAnalysis}