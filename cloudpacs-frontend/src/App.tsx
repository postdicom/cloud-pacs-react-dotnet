import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router";
import { Navigate, Outlet } from 'react-router'
import './App.css'
import Login from './login'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PrivateRoutes/>}>
            <Route path="login" element={<Login />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    {/* Hello World  */}
      
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
