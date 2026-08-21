import { useEffect, useState } from "react";
import '../stylesheets/dashboard.css';
import Navbar from '../components/adminPanelNavbar';
import { useLocation, useNavigate } from "react-router-dom";
import api from "../queryClientProvider";

function Dashboard() {
    const navigate = useNavigate();
    const clientAccounts = () => {
        navigate('/ClientAccounts');
    }
    const createAccount = () => {
        navigate('/CreateAccount');
    }

    return (
        <div className="register-layout">
            <Navbar />
            <div className="main-content">
                <div className="dashboard-top">
                    <div className="dashboard-title">Dashboard</div>
                    <button className="create-account-button" onClick={() => createAccount()}>+ Create Account</button>
                </div>
                <div className="dashboard-header">
                    <div className="header-items">Total Accounts</div>
                    <div className="header-items">Active</div>
                    <div className="header-items">Storage Used</div>
                    <div className="header-items">Total Users</div>
                </div>

                <div className="account-table-wrapper">
                    <div className="account-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ margin: 0 }}>Recent Accounts</h4>
                        <div onClick={() => clientAccounts()}>View all →</div>
                    </div>
                    <div className="scroll">
                        <table className="studies-table">
                            <thead>
                                <tr>
                                    <th>ACCOUNT</th>
                                    <th>STATUS</th>
                                    <th>STORAGE</th>
                                    <th>USERS</th>
                                    <th>CREATED</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>sdf</td>
                                    <td>sdf</td>
                                </tr>
                                <tr>
                                    <td>sfds</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;