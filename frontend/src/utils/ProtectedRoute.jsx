import React, { useContext } from 'react';
import { Navigate,Route,useNavigate ,useLocation } from 'react-router';
import { AuthContext } from '../context/AuthContext'; 

export function ProtectedRoute({ children }) {
    const { isLoggedIn } = useContext(AuthContext);
    const location = useLocation();
  
    if (!isLoggedIn) {
       
    
        return  <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
