import { useState } from 'react'
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import './App.css'
/* import NotFound from './pages/pageNotFound';
import UnAuthorized from './pages/unAuthorizedWarning'; */
import AdminLogin from './pages/adminLogin';
import Dashboard from './pages/dashboard';
import ClientAccounts from './pages/clientAccounts';
import CreateAccount from './pages/createAccount';
import AccountDetails from './pages/accountDetails';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <>

        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/DashBoard" element={<Dashboard />}></Route>
            <Route path="/ClientAccounts" element={<ClientAccounts />}></Route>
            <Route path="/CreateAccount" element={<CreateAccount />}></Route>
            <Route path="/AccountDetails" element={<AccountDetails />}></Route>
          </Route>
          <Route path="/AdminLogin" element={<AdminLogin />}></Route>
          {/* <Route path="/UnAuthorized" element={<UnAuthorized />}></Route>
          <Route path="*" element={<NotFound />} /> */}
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
