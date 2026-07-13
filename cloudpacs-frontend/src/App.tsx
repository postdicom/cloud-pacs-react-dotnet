import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router";
import { Navigate, Outlet } from 'react-router'
import './App.css'
import Login from './pages/login'
import Register from './pages/register'
import Navbar from './pages/navbar'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PrivateRoutes/>}>
            <Route path="login" element={<Login />}></Route>
            <Route path="Register" element={<Register />}></Route>
            <Route path="Navbar" element={<Navbar />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

const PrivateRoutes = () => {
  let auth = {'token':true}
  return (
    auth.token ? <Outlet/> : <Navigate to='/login'/>
  )
}

export default App
