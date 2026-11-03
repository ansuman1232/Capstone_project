import multer from'multer';
import path from 'path';
import fs from 'fs';
import {drive} from '../config/drive.js';
import { Analysis } from '../models/Analysis.js';
import { addVideoJob } from '../Queue/videoQueue.js';


const tmpDir= path.resolve(process.cwd(),'tmp');
if(!fs.existsSync(tmpDir)){
    fs.mkdirSync(tmpDir,{recursive:true})
   
}


const storage =multer.diskStorage({
    destination:(req,file,cb)=>cb(null,tmpDir),
    filename:(req,file,cb)=>{
        const uniqueSuffix=`${Date.now()}-${Math.round(Math.random()*1e9)}`
        cb(null,`${uniqueSuffix}${path.extname(file.originalname)}`)
    }
})


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
        
        const newAnalysis=await Analysis.create({
          userId:req.body.userId,
          filename:req.file.originalname,
          status:'PENDING'
        })
        const analysisId= newAnalysis._id;
        
        const driveResponse =await drive.files.create({
            requestBody:{
                name:`${analysisId}_${req.file.originalname}`,
                parents:[process.env.GDRIVE_FOLDER_ID]
            },
            media:{
                mimeType:req.file.mimeType,
                body:fs.createReadStream(tempFilePath)
            },
             
    supportsAllDrives: true 

        })

        const gDriveFileId= driveResponse.data.id;
       
        await addVideoJob(analysisId,gDriveFileId);

      
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