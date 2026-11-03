import {createContext,useContext,useEffect,useState,useMemo} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

export const AuthContext =createContext({});

export const api= axios.create({
    baseURL: "http://localhost:8000/api/v1",
    withCredentials:true
})

export const apiPrivate =axios.create({
    baseURL:"http://localhost:8000/api/v1",
    withCredentials:true
})

export function AuthProvider({children}){
    const [isLoggedIn,setIsLoggedIn]=useState(false);
    const [accessToken,setAccessToken]=useState(null);
   
    const [username,setUsername]=useState("");
    const [userId,setUserId]=useState("")
    const [error,setError]=useState("");
    const route=useNavigate();

    useEffect(()=>{
        if(!error)return;
        let timer=setTimeout(()=>{setError("")},3000);
        return ()=>clearTimeout(timer)
    },[error])


    useEffect(()=>{
        const requestIntercept =apiPrivate.interceptors.request.use(
           (config)=>{
            if(!config.headers['Authorization'] && accessToken){
                config.headers['Authorization']=`Bearer ${accessToken}`
            }
            return config;
           },
           (error)=>Promise.reject(error)

        )

        const responseIntercept= apiPrivate.interceptors.response.use(
            (response)=>response,
            async(error)=>{
                const prevRequest=error?.config;

                if(error?.response?.status===403 && !prevRequest?.sent){
                    prevRequest.sent=true;
                    try{
                        const response =await apiPrivate.post('/user/refresh')
                        const newAccessToken=response.data.accessToken;

                        setAccessToken(newAccessToken);
                        prevRequest.headers['Authorization']=`Bearer ${newAccessToken}`;
                        return apiPrivate(prevRequest);
                    }
                    catch(refreshError){
                        setIsLoggedIn(false);
                        setAccessToken(null);
                        route("/login");
                        return Promise.reject(refreshError);
                    }
                   
                }
                 return Promise.reject(error)
            }
        )

        return ()=>{
            apiPrivate.interceptors.request.eject(requestIntercept);
            apiPrivate.interceptors.response.eject(responseIntercept);
        }
    },[accessToken,route])
 
    async function handleLogin(username,password){
     
            const response=await api.post("/user/login",{username,password}).then(
             (response)=>{
                 if(response.status===200){
                const token=response.data.accessToken;
                setAccessToken(token);
                setUserId(response.data.userId)
                setUsername(username);
                setIsLoggedIn(true)
               setTimeout(()=>route("/dashboard"),0)
            }
             }

            )
            .catch((e)=> {setError(e.response?.data?.message || "Login failed");})
       
    }


    async function handleLogout(){
        try{
            await apiPrivate.delete("/user/logout");
            setAccessToken(null);
            setIsLoggedIn(false);
            setUserId("")
            setUsername("")
            route("/login")
        }
        catch(e){
            console.log("Logout error on server",e);
        }
      
    }

    async function handleRegister(username,password,email){

        try{
            const response=await api.post("/user/register",{username,password,email});
             const response1=await api.post("/user/login",{username,password});
             if(response1.status===200){
                const token=response1.data.accessToken;
                setAccessToken(token);
                setUserId(response1.data.userId)
                setUsername(username);
                setIsLoggedIn(true);
                route("/dashboard");
             }
        }
        catch(e){
            setError(e.response?.data?.message || "Login failed. please try again");
        }
    }



    const data=useMemo(()=>{
      return{
        isLoggedIn,
      setIsLoggedIn,
      handleLogin,
      handleLogout,
      handleRegister,
      username,
      error,
      userId
      }
    },[isLoggedIn,error]);


    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
    
}