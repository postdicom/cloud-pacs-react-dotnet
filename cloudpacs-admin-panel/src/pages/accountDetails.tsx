import '../stylesheets/accountDetails.css';
import Navbar from '../components/adminPanelNavbar';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import api from '../queryClientProvider';
import type { User } from '../interfaces/User';

function accountDetails() {
    const [activeTab, setActiveTab] = useState("Overview");
    const [deletionText, setDeletionText] = useState("");
    const [users, setUsers] = useState<User[]>([]);

    const location = useLocation();
    const account = location.state?.account;

    const [storageLimit, setStorageLimit] = useState<number>(account.totalStorage);
    const [accountStatus, setAccountStatus] = useState<string>(account.status);
    const [internalNotes, setInternalNotes] = useState<string>(account.internalNotes);

    useEffect(() => {
        const callApi = async () => {
            try {
                const response = await api.get(`api/Account/${account.accountId}/users`);
                setUsers(response.data);
            } catch (error) {
                console.log("Error " + error);
            }
        }
        callApi();
    }, []);

    const handleStorageLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStorageLimit(parseInt(event.target.value));
    }

    const handleAccountStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAccountStatus(event.target.value);
    }

    const handleInternalNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInternalNotes(event.target.value);
    }

    async function updateTotalStorage() {
        try {
            await api.post(`api/Account/${account.accountId}/updateStorageLimit/${storageLimit}`);
        } catch (error) {
            console.log("Error " + error);
        }
    }

    async function updateStatus() {
        try {
            await api.post(`api/Account/${account.accountId}/updateStatus`, {
                status: accountStatus
            });
        } catch (error) {
            console.log("Error " + error);
        }
    }

    async function updateInternalNotes() {
        try {
            await api.post(`api/Account/${account.accountId}/updateInternalNotes/${internalNotes}`,{
                status: accountStatus
            });
        } catch (error) {
            console.log("Error " + error);
        }
    }

    const statusSettings = [
        { status: "Active", label: "Active", modColor: "#d1fae5", modText: "#065f46" },
        { status: "ViewOnly", label: "View-Only", modColor: "#fef3c7", modText: "#92400e" },
        { status: "Suspended", label: "Suspended", modColor: "#fee2e2", modText: "#991b1b" }
    ]

    const getStatusSetting = (status: string | number) =>
        statusSettings.find((item) => String(item.status) === String(status));

    const statusLabel = (status: string) => getStatusSetting(status)?.label ?? "";
    const statusModColor = (status: string) => getStatusSetting(status)?.modColor ?? "";
    const statusModText = (status: string) => getStatusSetting(status)?.modText ?? "";

    const handleDeletionInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDeletionText(event.target.value);
    };

    useEffect(() => {
        const btn = document.getElementById("delete-account-button") as HTMLButtonElement | null;
        if (btn) {
            if (deletionText === account.accountName) {
                btn.disabled = false;
            }
            else {
                btn.disabled = true;
            }
        }
    }, [deletionText]);

    const navigate = useNavigate();

    const clientAccounts = () => {
        navigate('/ClientAccounts');
    }

    return (
        <>
            <div className="container">
                <Navbar />
                <div className='account-details-main-content'>
                    <div className='account-details-top-bar'>
                        <div className='navigation-to-client-accounts' onClick={clientAccounts}>← Client Accounts</div>
                        <div className='side-by-side'>
                            <div className='client-account-name'>{account.accountName}</div>
                            <div style={{
                                padding: '4px 12px',
                                borderRadius: '16px',
                                fontWeight: 'bold',
                                fontSize: '0.85rem',
                                color: statusModText(account.status),
                                backgroundColor: statusModColor(account.status)
                            }}>{statusLabel(account.status)}</div>
                        </div>
                        <div className='side-by-side'>
                            <div>{account.accountId}
                                &middot;
                                {new Date(account.updatedAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}
                                &middot;
                                {account.numOfUsers} users</div>
                        </div>
                        <div className="tabs-container">
                            <button
                                className={`tab-btn ${activeTab === "Overview" ? "active" : ""}`}
                                onClick={() => setActiveTab("Overview")}
                            >
                                Overview
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "Users" ? "active" : ""}`}
                                onClick={() => setActiveTab("Users")}
                            >
                                Users
                            </button>
                            <button
                                className={`tab-btn ${activeTab === "Danger Zone" ? "active" : ""}`}
                                onClick={() => setActiveTab("Danger Zone")}
                            >
                                Danger Zone
                            </button>
                        </div>
                    </div>
                    <div className="account-details scroll">
                        {activeTab === "Overview" && <>
                            <div className='storage-plan-section'>
                                <div className='overview-section'>
                                    <div className='account-detail-subtitle'>Storage Quota</div>
                                    <div className='plan-option-selection'>
                                        <div className='storage-section-top'>
                                            <div className='plan-text'>Used</div>
                                            <div className='plan-text'>{account.usedStorage} GB</div>
                                        </div>
                                        <progress id='storage-progress-bar' value={account.usedStorage / account.totalStorage}></progress>
                                        <div className='storage-section-bottom'>
                                            <div className='plan-text'>Limit:</div>
                                            <input id='storage-input' type="number" defaultValue={storageLimit} onChange={handleStorageLimit} />
                                            <div className='plan-text'>GB</div>
                                            <button className='save-storage-button' onClick={() => updateTotalStorage()}>Save</button>
                                        </div>
                                    </div>
                                </div>

                                <div className='overview-section'>
                                    <div className='account-detail-subtitle'>Plan Status</div>
                                    <div className='status-option-selection'>
                                        <span>
                                            <input type="radio" name="status" id="" value="Active" 
                                            checked={accountStatus === "Active"}
                                            onChange={(e) => setAccountStatus(e.target.value)}/>
                                            Active — full access (upload, view, manage users)
                                        </span>

                                        <span>
                                            <input type="radio" name="status" id="" value="ViewOnly" 
                                            checked={accountStatus === "ViewOnly"}
                                            onChange={(e) => setAccountStatus(e.target.value)}/>
                                            View-only — existing data accessible, no new uploads
                                        </span>

                                        <span>
                                            <input type="radio" name="status" id="" value="Suspended" 
                                            checked={accountStatus === "Suspended"}
                                            onChange={(e) => setAccountStatus(e.target.value)}/>
                                            Suspended — account locked, users cannot log in
                                        </span>
                                    </div>
                                    <button id='status-change-button' onClick={() => updateStatus()}>Apply status change</button>
                                </div>
                            </div>

                            <div className='overview-section'>
                                <div className='account-detail-subtitle'>Internal Notes</div>
                                <div className='overview-internal-notes-section'>
                                    <input
                                        className='overview-internal-notes-input'
                                        type="text"
                                        name=""
                                        id=""
                                        placeholder='Private notes visible only to console admins…'
                                        onChange={handleInternalNotes}
                                        defaultValue={internalNotes} />
                                    <button className='save-notes-button' onClick={() => updateInternalNotes()}>Save notes</button>
                                </div>
                            </div>
                        </>
                        }

                        <div className='register-layout'>
                            {activeTab === "Users" && <>
                                <div className="scroll">
                                    <table className="studies-table">
                                        <thead>
                                            <tr>
                                                <th>NAME</th>
                                                <th>EMAIL</th>
                                                <th>ROLE</th>
                                                <th>STATUS</th>
                                                <th>LAST LOGIN</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user: User) => (
                                                <tr key={account.accountId}>
                                                    <td className="dahboard-account-name">{user.name}</td>
                                                    <td className="dahboard-account-email">{user.email}</td>
                                                    <td className="dahboard-account-role">
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
                                                            {user.role}
                                                        </span>

                                                    </td>
                                                    <td className="dahboard-account-status">{user.status}</td>
                                                    <td className="dahboard-account-creation-date">{new Date(account.updatedAt)
                                                        .toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                            }
                        </div>

                        {activeTab === "Danger Zone" && <>
                            <div className='deletion-box'>
                                <div className='delete-header'>Delete this account</div>
                                <div>This will permanently and irreversibly delete:</div>
                                <ul id='deletion-info-list'>
                                    <li> &middot; All {account.numOfUSers} users and their login credentials</li>
                                    <li> &middot; All DICOM studies and image files ({account.usedStorage} GB)</li>
                                    <li> &middot; All patient records and audit logs</li>
                                    <li> &middot; The account itself ({account.accountId})</li>
                                </ul>
                                <div id='delete-instruction'>Type "{account.accountName}" to confirm:</div>
                                <input
                                    type="text"
                                    placeholder='Type the account name exaclty'
                                    value={deletionText}
                                    id='deletion-input'
                                    onChange={handleDeletionInput}
                                />
                                <button id='delete-account-button' disabled>Delete account permanently</button>
                            </div>
                        </>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default accountDetails;