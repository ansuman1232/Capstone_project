

import {AuthContext,api } from '../context/AuthContext.jsx'
import { useState,useContext } from 'react'
import '../styles/Login.css'

function Login(){
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    
   
    const[email,setEmail]=useState("")
    const [isRegistion,setIsRegistion]=useState(false);
   
    const {handleLogin,handleLogout,handleRegister,error}=useContext(AuthContext);


    return(
        <div className="login-page">
            <div className="login-card">
                <h2 className="login-title">{isRegistion ? "Create your account" : "Welcome back"}</h2>
                <p className="login-subtitle">{isRegistion ? "Register " : "Sign in "}</p>

                <form className="login-form">
                    <label className="login-label">
                        Username
                        <input className="login-input" type="text" placeholder='enter username' value={username} onChange={(e)=>{setUsername(e.target.value)}}/>
                    </label>

                    <label className="login-label">
                        Password
                        <input className="login-input" type="password" placeholder='enter password' value={password} onChange={(e)=>{setPassword(e.target.value)}} />
                    </label>

                    {isRegistion && (
                        <label className="login-label">
                            Email
                            <input className="login-input" type="email" placeholder='enter email' value={email} onChange={(e)=>{setEmail(e.target.value)}}/>
                        </label>
                    )}

                    <button className="login-submit" onClick={isRegistion?(e)=>{e.preventDefault();handleRegister(username,password,email)}:(e)=>{e.preventDefault();handleLogin(username,password)}}>{isRegistion?"Register":"Login"}</button>

                    {error && <p className="login-error">{error}</p> }
                </form>

                <button type="button" className="login-toggle" onClick={()=>{setIsRegistion(!isRegistion)}}>{isRegistion?"go to login":"go to Registration"}</button>
            </div>
        </div>
    )
}

export default Login;