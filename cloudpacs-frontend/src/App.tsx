import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router";
import { Navigate, Outlet } from 'react-router'
import './App.css'
import Navbar from './components/navbar'
import Login from './pages/login'
import Register from './pages/register'
import DicomViewer from './pages/dicomViever'
import StudyList from './pages/studyList'
import PatientList from './pages/patientList'
import Upload from './pages/upload'

function App() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="Login" element={<Login />}></Route>
            <Route path="Register" element={<Register />}></Route>
            <Route path="StudyList" element={<StudyList />}></Route>
            <Route path="DicomViewer" element={<DicomViewer />}></Route>
            <Route path="PatientList" element={<PatientList />}></Route>
            <Route path="Upload" element={<Upload onFileChange={setFiles}/>}></Route>
          </Route>
          <Route path="Register" element={<Register />}></Route>
          <Route path="Login" element={<Login />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

const ProtectedRoute = () => {
  let auth = { 'token': true }
  return (
    auth.token ? <Outlet /> : <Navigate to='/Login' />
  )
}

export default App
