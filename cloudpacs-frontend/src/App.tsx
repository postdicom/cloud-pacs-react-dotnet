import { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import './App.css'
import Login from './pages/login'
import Register from './pages/register'
import DicomViewer from './pages/dicomViever'
import StudyList from './pages/studyList'
import PatientList from './pages/patientList'
import Upload from './pages/upload'
import Cornerstone from './pages/cornerstone';
import NotFound from './pages/pageNotFound';
import UnAuthorized from './pages/unAuthorizedWarning';
import AdminLogin from './pages/adminPanel/adminLogin';
import Dashboard from './pages/adminPanel/dashboard';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <>

        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/StudyList" element={<StudyList />}></Route>
            <Route path="/DicomViewer" element={<DicomViewer />}></Route>
            <Route path="/PatientList" element={<PatientList />}></Route>
            <Route path="/Upload" element={<Upload onFileChange={setFiles}/>}></Route>
            <Route path="/Cornerstone" element={<Cornerstone />}></Route>
            <Route path="/AdminLogin" element={<AdminLogin />}></Route>
            <Route path="/DashBoard" element={<Dashboard />}></Route>
          </Route>
          <Route path="/Register" element={<Register />}></Route>
          <Route path="/Login" element={<Login />}></Route>
          <Route path="/UnAuthorized" element={<UnAuthorized />}></Route>
          <Route path="*" element={<NotFound />} />
        </Routes>

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
