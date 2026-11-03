import NavMenu from "./NavMenu";
import {api ,apiPrivate, AuthContext} from '../context/AuthContext.jsx'
import { useEffect,useState,useContext,useRef } from "react";
import "../styles/AiAnalysis.css"


function AiAnalysis(){
    const {userId} =useContext(AuthContext);
    const [message,setMessage]=useState();
   const [uploading,setupLoading] =useState(false);
	const [file, setFile] = useState(null);
    const  [error,setError]=useState(""); 

     let activeRequest = useRef(null); 

    const onFileChange = (event) => {
		setFile(event.target.files[0]);
	};  

   async function handleSubmit(e){
   
    e.preventDefault();
    const formData = new FormData();
 
    formData.append("video", file);

    formData.append("userId", userId);
    if(activeRequest.current){
    try{
      const res=  await activeRequest.current;
      setMessage(res.data.message);
     }
    catch(e){
      console.log(e)
      setError(e.response?.data?.error)
    }
    return;
   }
  


   try{
     setupLoading(true);

   
    activeRequest.current=apiPrivate.post("/info/analysis",formData);
   
     const res=  await activeRequest.current;
      setMessage(res.data.message);
      
   }catch(e){
      console.log(e.response?.data?.error)
      setError(e.response?.data?.error)
    }

    finally{
       
        activeRequest.current=null;
        setupLoading(false)
    }


}

 
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(""), 3000);
        return () => clearTimeout(timer);
    }, [message]);

    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(""), 3000);
        return () => clearTimeout(timer);
    }, [error]);



	const fileData = () => {
		if (file) {
			return (
				<div>
					<h2>File Details:</h2>
					<p>File Name: {file.name}</p>
					<p>File Type: {file.type}</p>
					<p>
						Last Modified: {file.lastModifiedDate.toDateString()}
					</p>
				</div>
			);
		} else {
			return (
				<div>
					<br />
					<h4>Choose before Pressing the Upload button</h4>
				</div>
			);
		}
	};


  
       return(
        <>
        <NavMenu/>
        <div className="ai-page">
          <div className="ai-container">
            <span className="ai-badge">AI-powered video analysis</span>
            <h1 className="ai-title">Analyze a video</h1>
            <p className="ai-subtitle">
              Upload a video and our AI will check it for deepfake signs and tell you whether it's real or fake.
            </p>

            <div className="ai-card">
              <form className="ai-form" onSubmit={(e)=>handleSubmit(e)}>
                <label className="ai-dropzone">
                  
                  <span className="ai-dropzone-text">Click to choose a video file</span>
                  <span className="ai-dropzone-hint">MP4, MOV, AVI and other video formats</span>
                  <input className="ai-file-input" onChange={onFileChange} type="file"></input>
                </label>

                <div className="ai-file-details">
                  {fileData()}
                </div>

                <button className="ai-submit">Upload</button>
              </form>

              {uploading && (
                <div className="ai-uploading">
                  <span className="ai-spinner"></span>
                  <span>uploading the video...</span>
                </div>
              )}
            </div>
          </div>

          {message && <div className="ai-toast ai-toast-success">{message}</div>}
          {error && <div className="ai-toast ai-toast-error">{error}</div>}
        </div>
        </>
    )





}

export default AiAnalysis;