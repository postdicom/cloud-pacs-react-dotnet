import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router";
import { Navigate, Outlet } from 'react-router'
import './App.css'
import Login from './pages/login'
import Register from './pages/register'
import PatientList from './pages/patientList'
import Navbar from './components/navbar.tsx'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="Navbar" element={<Navbar />}></Route>
            <Route path="patientList" element={<PatientList />}></Route>
          </Route>
          <Route path="Register" element={<Register />}></Route>
          <Route path="login" element={<Login />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

const ProtectedRoute = () => {
  let auth = { 'token': true }
  return (
    auth.token ? <Outlet /> : <Navigate to='/login' />
  )
}

export default App
