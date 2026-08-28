import { useEffect, useState } from "react";
import '../stylesheets/dashboard.css';
import Navbar from '../components/adminPanelNavbar';
import { useLocation, useNavigate } from "react-router-dom";
import api from "../queryClientProvider";
import type { Account } from "../interfaces/Account";

function Dashboard() {
    const [accounts, setAccount] = useState<Account[]>([]);
    const [activeAccounts, setActiveAccounts] = useState<number>(0);
    const [storageUsed, setStorageUsed] = useState<number>(0);
    const [numOfUsers, setNumOfUsers] = useState<number>(0);

    useEffect(() => {
        const callApi = async () => {
            try {
                const response = await api.get("api/Account");
                setAccount(response.data);
                response.data.forEach((element: Account) => {
                    if (element.status === "Active") {
                        setActiveAccounts(prev => prev + 1);
                    }
                    setStorageUsed(prev => prev + element.usedStorage);
                    setNumOfUsers(prev => prev + element.numOfUsers);
                });
            } catch (error) {
                console.log("Error " + error);
            }
        }
        callApi();
    }, []);

    const statusSettings = [
        { status: "Active", label: "Active", modColor: "#d1fae5", modText: "#065f46" },
        { status: "ViewOnly", label: "View-Only", modColor: "#fef3c7", modText: "#92400e" },
        { status: "Suspended", label: "Suspended", modColor: "#fee2e2", modText: "#991b1b" }
    ]

    const getStatusSetting = (status: string) =>
        statusSettings.find((item) => String(item.status) === String(status));

    const statusLabel = (status: string) => getStatusSetting(status)?.label ?? "";
    const statusModColor = (status: string) => getStatusSetting(status)?.modColor ?? "";
    const statusModText = (status: string) => getStatusSetting(status)?.modText ?? "";

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
                    <div className="header-items">
                        <div className="header-items-value">{accounts.length}</div>
                        <div>Total Accounts</div>
                    </div>
                     <div className="header-items">
                        <div className="header-items-value">{activeAccounts}</div>
                        <div>Active</div>
                    </div>
                    <div className="header-items">
                        <div className="header-items-value">{storageUsed}</div>
                        <div>Storage Used</div>
                    </div>
                    <div className="header-items">
                        <div className="header-items-value">{numOfUsers}</div>
                        <div>Total Users</div>
                    </div>
                </div>

                <div className="account-table-wrapper scroll">
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
                                {accounts.map((account: Account) => (
                                    <tr key={account.accountId}>
                                        <td className="dahboard-account-name">{account.accountName}</td>
                                        <td className="dahboard-account-status">
                                            <span
                                                className="action-chip"
                                                style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '16px',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem',
                                                    color: statusModText(account.status),
                                                    backgroundColor: statusModColor(account.status)
                                                }}
                                            >
                                                {statusLabel(account.status)}
                                            </span>

                                        </td>
                                        <td className="dahboard-account-storage">
                                            <progress
                                                className="dahboard-progress-bar"
                                                value={account.usedStorage / account.totalStorage}
                                            ></progress>
                                            {account.usedStorage} / {account.totalStorage} GB
                                        </td>
                                        <td className="dahboard-account-user-amount">{account.numOfUsers}</td>
                                        <td className="dahboard-account-creation-date">{new Date(account.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;