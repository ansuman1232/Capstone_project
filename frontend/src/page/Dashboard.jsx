import NavMenu from "./NavMenu";
import { apiPrivate, AuthContext } from "../context/AuthContext";
import { useContext, useEffect,useState } from "react";
import "../styles/Dashboard.css";

function Dashboard(){
    const {userId}=useContext(AuthContext)
  const [analysis,setAnalysis] =useState([]);
 async function getPastAnalysis(){
   let res= await apiPrivate.get(`/info/analysis/${userId}`); 
   setAnalysis(res.data.analysis)
 }

 useEffect(()=>{
  getPastAnalysis();
 },[])

return(
    <>
    <NavMenu/>
    <div className="db-page">
      <div className="db-container">
        <div className="db-header">
          <h1 className="db-title">Past Analysis</h1>
          <span className="db-count">{analysis.length} {analysis.length === 1 ? "result" : "results"}</span>
        </div>

        {analysis.length === 0 && (
          <div className="db-empty">
           
            <p>No analysis yet. Your analyzed videos will appear here.</p>
          </div>
        )}

        <div className="db-grid">
        { analysis.map(
            (data, i)=>{
                const prediction = String(data.prediction ?? "").toLowerCase();
                const predClass = prediction.includes("fake") ? "db-pred-fake" : prediction.includes("real") ? "db-pred-real" : "db-pred-neutral";
                return (
                <div className="db-card" key={i} style={{animationDelay: `${i * 0.06}s`}}>
                  <div className="db-card-top">
                    
                    <p className="db-filename" title={data.filename}>{data.filename}</p>
                  </div>

                  <div className="db-row">
                    <span className="db-label">Status</span>
                    <span className="db-status">{data.status}</span>
                  </div>

                  <div className="db-row">
                    <span className="db-label">Prediction</span>
                    <span className={`db-pred ${predClass}`}>{data.prediction}</span>
                  </div>
                  
                  <div className="db-row">
                    <span className="db-label">Confidence</span>
                    <span className="db-status">{data.confidence}</span>
                  </div>


                  <div className="db-row">
                    <span className="db-label">Face-neck correlation</span>
                    <span className="db-metric">{data.metrics.faceNeckCorrelation}</span>
                   
                  </div>
                </div>)
            }
         )
        }
        </div>
      </div>
    </div>
    </>
)
}

export default Dashboard;