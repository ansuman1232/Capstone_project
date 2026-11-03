import bcrypt from 'bcrypt'
import {User} from '../models/User.js';

import jwt from 'jsonwebtoken';



const register = async(req,res)=>{
  

    if(!req.body.username || !req.body.password ||!req.body.email)return res.status(400).json({message:"username , password and email are required"});
        let {username,password,email}=req.body;
      
    let user= await User.findOne({username})
  
    if(user) res.status(409).json({message:"user with this username already exist please try some other username"});
    else{
     let hash=await bcrypt.hash(password,3);
     await User.insertOne({username,password:hash,email});
    
     res.status(200).json({message:"Your account is created"})
    }
}


const login =async(req,res)=>{
    if(!req.body)return res.status(400).json({message:"no data found"});

    let {username,password}=req.body;

    if(!username || !password)return res.status(400).json({message:"please enter username and password"});

    let user=await User.findOne({username});
    
    if(!user) return res.status(400).json({message:"no  user with that username"})

    let iscorrect=await bcrypt.compare(password,user.password);

    if(iscorrect){
        const accessToken=generateAccessToken(user);
        const refreshToken=generateRefreshToken(user);

        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
              sameSite: 'lax', 
               secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })

        res.json({accessToken,message:"welcome to our website",userId:user._id})
    }
    else return res.status(400).json({message:"password is incorrect"});
}

const refresh= (req,res)=>{
    const refreshToken=req.cookie?.refreshToken;

    if(!refreshToken) return res.status(401).json({message:"please login"})

    jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,decoded)=>{
        if(!err) return res.status(403).json({message:"forbiden Token"})
        
        const accessToken=generateAccessToken({username:decoded.username});
        return res.json({accessToken})
    })
}


const logout=(req,res)=>{
    res.clearCookie("refreshToken",{
        httpOnly:true,
        secure:true,
        
    })

    return res.json({message:"user logged our successfuly"})
}


 const generateAccessToken =(user)=>{
   return jwt.sign(
    {name:user.username},
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:"15m"}
   )
}
 const generateRefreshToken=(user)=>{
    return jwt.sign(
        {name:user.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:"7d"}
    )
}



export {logout,login,refresh,register}