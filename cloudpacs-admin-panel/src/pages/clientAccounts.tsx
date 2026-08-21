import { useEffect, useState } from "react";
import '../stylesheets/dashboard.css';
import Navbar from '../components/adminPanelNavbar';
import { useLocation, useNavigate } from "react-router-dom";
import api from "../queryClientProvider";

function clientAccounts() {
    const navigate = useNavigate();
    const createAccount = () => {
        navigate('/CreateAccount');
    }

    return (
        <div className="register-layout">
            <Navbar />
            <div className="main-content">
                <div className="dashboard-top">
                    <div className="dashboard-title">Client Accounts</div>
                    <button className="create-account-button" onClick={() => createAccount()}>+ Create Account</button>
                </div>

                {/* <div className="account-table-wrapper"> */}
                    <div className="scroll">
                        <table className="studies-table">
                            <thead>
                                <tr>
                                    <th>ACCOUNT NAME</th>
                                    <th>ACCOUNT ID</th>
                                    <th>STATUS</th>
                                    <th>STORAGE</th>
                                    <th>USERS</th>
                                    <th>LAST ACTIVITY</th>
                                    <th></th>
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
                {/* </div> */}
            </div>
        </div>
    );
}

export default clientAccounts;