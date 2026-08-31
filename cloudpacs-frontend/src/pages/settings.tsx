import { useEffect, useState } from "react";
import "../stylesheets/settings.css";
import Navbar from '../components/navbar';
import { useNavigate } from "react-router-dom";
import api from "../queryClientProvider";

function Settings() {
    const [activeTab, setActiveTab] = useState("Profile & Security");

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

    useEffect(() => {
        /* const callApi = async () => {
            try {
                const data = (await api.get("api/Patients"));
                patients = data.data;
                Array.from(patients).forEach(element => {
                    const patient: Patient = element;
                    setUsablePatientsList((prev) => [...prev, patient]);
                });
                setNumberOfPatients(() => patients.length);
                setSearchedPatientList(usablePatientsList);
            } catch (error) {
                console.log("Error " + error);
            }
        };

        callApi(); */
    }, []);

    return (
        <>
            <div className="settings-container">
                <Navbar />
                <div className="settings-main-content">
                    <div className="settings-navigation">
                        <div id="settings-title">SETTINGS</div>
                        <button className="settings-tab" onClick={() => setActiveTab("Profile & Security")}>Profile & Security</button>
                        <button className="settings-tab" onClick={() => setActiveTab("Users")}>Users</button>
                    </div>
                    <div className="settings-pages">
                        {activeTab === "Profile & Security" && (
                            <>
                                <div id="account-role-info-box">

                                </div>
                                <div className="profile-security-box">
                                    <div className="profile-security-box-title">Profile</div>
                                    <div className="profile-security-box-input-box">
                                        <div className="profile-security-box-subtitle">Display Name</div>
                                        <input className="profile-security-box-input" type="text" />
                                        <div className="profile-security-box-subtitle">Email</div>
                                        <input className="profile-security-box-input" type="text" readOnly />
                                        <button className="profile-security-box-button">Save name</button>
                                    </div>
                                </div>
                                <div className="profile-security-box">
                                    <div className="profile-security-box-title">Change Password</div>
                                    <div className="profile-security-box-input-box">
                                        <div className="profile-security-box-subtitle">Current Password</div>
                                        <input className="profile-security-box-input" type="password" placeholder="••••••••" />
                                        <div className="profile-security-box-subtitle">New Password</div>
                                        <input className="profile-security-box-input" type="text" placeholder="Min. 8 Characters" />
                                        <button className="profile-security-box-button">Update password</button>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "Users" && (
                            <>
                                <div className="users-title">Users & Invitations</div>
                                <div className="invite-new-user-box">
                                    <div id="invite-user-title">Invite a new user</div>
                                    <div className="new-user-detail-selection">
                                        <div className="user-addition-section">
                                            <div className="invite-user-subtitle">Email address</div>
                                            <input className="profile-security-box-input" id="" type="email" placeholder="jane@clinic.com" />
                                        </div>
                                        <div className="user-addition-section">
                                            <div className="invite-user-subtitle">Role</div>
                                            <select className="role-selection" name="" id="">
                                                <option value="Radiologist">Radiologist</option>
                                                <option value="Viewer">Viewer</option>
                                            </select>
                                            <button id="send-invitation-button">Send invitation</button>
                                        </div>



                                        <div className="scroll">
                                            <table className="studies-table">
                                                <thead>
                                                    <tr>
                                                        <th>NAME</th>
                                                        <th>ROLE</th>
                                                        <th>STATUS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* {users.map((user: User) => (
                                                        <tr key={account.accountId}>
                                                            <td className="dahboard-account-name">{user.name}</td>
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
                                                        </tr>
                                                    ))} */}
                                                </tbody>
                                            </table>
                                        </div>



                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Settings;