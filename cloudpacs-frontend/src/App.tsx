import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router";
import { Navigate, Outlet } from 'react-router'
import './App.css'
import Login from './pages/login'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute/>}>
            
          </Route>
            <Route path="login" element={<Login />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

const ProtectedRoute = () => {
  let auth = {'token':true}
  return (
    auth.token ? <Outlet/> : <Navigate to='/login'/>
  )
}

export default App
