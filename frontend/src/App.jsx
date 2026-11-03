import { useState } from 'react'
import { BrowserRouter ,Routes,Route} from 'react-router'
import './styles/App.css'
import Login from './page/Login.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import LandingPage from './page/LandingPage.jsx'
import AiAnalysis from './page/AiAnalysis.jsx'
import Dashboard from './page/Dashboard.jsx'
import { ProtectedRoute } from './utils/ProtectedRoute.jsx'
function App() {


  return (
    <>
    <BrowserRouter>
     <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login/>}></Route>
      <Route path="/aiAnalysis" element={<ProtectedRoute><AiAnalysis/></ProtectedRoute>}></Route>
      <Route path="/" element={<LandingPage/>}></Route>
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}></Route>
    </Routes>
    </AuthProvider>
    </BrowserRouter>
    </>
  )
}

export default App
