


import {Link} from 'react-router'
import '../styles/LandingPage.css'

function LandingPage(){
 return (
 <div className="lp">
   <div className="lp-bg">
     <div className="lp-grid"></div>
     <div className="lp-orb lp-orb-1"></div>
     <div className="lp-orb lp-orb-2"></div>
     <div className="lp-orb lp-orb-3"></div>
   </div>

   <header className="lp-nav">
    
     <div className="lp-nav-links">
       <Link className="lp-btn lp-btn-ghost" to="/dashboard">Dashboard</Link>
       <Link className="lp-btn lp-btn-solid" to="/login">Login / Sign up</Link>
     </div>
   </header>

   <section className="lp-hero">
     <div className="lp-hero-text">
       <span className="lp-badge">AI-powered video analysis</span>
       <h1 className="lp-title">
         Is that video <span className="lp-gradient-text">real</span> or <span className="lp-fake-text">fake</span>?
       </h1>
       <p className="lp-subtitle">
         Upload any video and our AI inspects every frame for deepfake signs,
         manipulated faces, and synthetic audio, then gives you a clear verdict in seconds.
       </p>
       <div className="lp-cta">
         <Link className="lp-btn lp-btn-solid lp-btn-lg" to="/login">Get Started</Link>
         <Link className="lp-btn lp-btn-ghost lp-btn-lg" to="/dashboard">Go to Dashboard</Link>
       </div>
       <div className="lp-stats">
         <div><strong>98%</strong><span>Detection accuracy</span></div>
         <div><strong>&lt;10s</strong><span>Average analysis</span></div>
         <div><strong>24/7</strong><span>Always available</span></div>
       </div>
     </div>

     <div className="lp-hero-visual">
       <div className="lp-scan-card">
         <div className="lp-scan-top">
           <span className="lp-dot lp-dot-r"></span>
           <span className="lp-dot lp-dot-y"></span>
           <span className="lp-dot lp-dot-g"></span>
           <span className="lp-scan-name">video_sample.mp4</span>
         </div>
         <div className="lp-scan-screen">
           <div className="lp-face">
             <div className="lp-face-head"></div>
             <div className="lp-face-body"></div>
           </div>
           <div className="lp-corner lp-corner-tl"></div>
           <div className="lp-corner lp-corner-tr"></div>
           <div className="lp-corner lp-corner-bl"></div>
           <div className="lp-corner lp-corner-br"></div>
           <div className="lp-scan-line"></div>
         </div>
         <div className="lp-scan-bottom">
           <div className="lp-progress"><div className="lp-progress-fill"></div></div>
           <div className="lp-verdict">
             <span className="lp-verdict-item lp-verdict-real">✔ AUTHENTIC</span>
             <span className="lp-verdict-item lp-verdict-fake">✖ DEEPFAKE DETECTED</span>
           </div>
         </div>
       </div>
       <div className="lp-float lp-float-1">Face analysis</div>
       <div className="lp-float lp-float-2">Audio check</div>
       <div className="lp-float lp-float-3">Frame consistency</div>
     </div>
   </section>

   <section className="lp-features">
     <div className="lp-feature">
      
       <h3>Upload</h3>
       <p>Drop in a video file and we handle the rest.</p>
     </div>
     <div className="lp-feature">
       
       <h3>AI Analysis</h3>
       <p>Deep learning models scan faces, motion, and audio for tampering.</p>
     </div>
     <div className="lp-feature">
       
       <h3>Clear Verdict</h3>
       <p>Get a real-or-fake result with a confidence score.</p>
     </div>
   </section>

   <footer className="lp-footer">© TruthLens AI. See the truth behind every video.</footer>
 </div>
 )
}

export default LandingPage;