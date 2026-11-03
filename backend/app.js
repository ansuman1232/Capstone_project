import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import UserRoute from './routes/User.js';
import InfoRoute from './routes/Info.js';
import './workers/videoWorker.js' 
import 'dotenv/config';
import multer from 'multer';
const app=express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.get('/test',(req,res)=>{
    res.send("hello")
})
// http://localhost:8000/api/v1/info/analysis
app.use(cors({ origin: 'http://localhost:5173',credentials: true }))
/*
The error occurs because your frontend is sending the request with credentials enabled (credentials: 'include' or withCredentials = true), but your backend is configured with origin: '*'. The browser strictly prohibits using the wildcard * for CORS when credentials (like cookies or authorization headers) are involved.
fix:-
app.use(cors({ origin: '*' })) 
change to 
app.use(cors({ 
  origin: 'http://localhost:5173', // Allow your exact frontend URL
  credentials: true                // Allow cookies and authorization headers
}));

*/


app.use("/api/v1/user/",UserRoute)
app.use("/api/v1/info/",InfoRoute);

// Global Error Handler for Multer errors (e.g. File too large or wrong extension)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer Error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});


async function main(){
    await mongoose.connect(`${process.env.MONGO_URL}`)
}



main().then(()=>app.listen(8000,()=>{console.log("server is listening to port 8000")}))
.catch(err=>{console.log(err)});

