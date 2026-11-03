import { useNavigate, useLocation } from 'react-router';
import { AuthContext } from "../context/AuthContext.jsx";
import { useState, useContext } from 'react';
import "../styles/NavMenu.css"

function NavMenu() {
  const { username, handleLogout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home",  path: "/dashboard", always: true },
    { label: "analyse", path: "/aiAnalysis", always: true },
    
  ];

  


  return (
    <>
      

     
      <button
        className={`nav-toggle-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <span className="hamburger-bar bar1" />
        <span className="hamburger-bar bar2" />
        <span className="hamburger-bar bar3" />
      </button>


      <div
        className={`nav-overlay ${isOpen ? "visible" : ""}`}
        onClick={() => setIsOpen(false)}
      />

     
      <nav className={`nav-drawer ${isOpen ? "open" : ""}`}>
       
        <div className="nav-drawer-header">
          <div className="nav-logo-icon"></div>
          
        </div>

      
        <div className="nav-user-pill">
          <div className="nav-user-avatar">
            {username ? username[0].toUpperCase() : "U"}
          </div>
          <span className="nav-username">{username}</span>
        
        </div>

     
        <div className="nav-items">
          {navItems.map((item) => (
           item.label!=="Pending Invoice" && <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => { navigate(item.path); setIsOpen(false); }}
            >
             
              {item.label}
            </button>
           
          ))}
        </div>

        <div className="nav-divider" />

     
        <div className="nav-footer">
          <button className="nav-logout-btn" onClick={handleLogout}>
             Sign out
          </button>
        </div>
      </nav>
    </>
  );
}

export default NavMenu;