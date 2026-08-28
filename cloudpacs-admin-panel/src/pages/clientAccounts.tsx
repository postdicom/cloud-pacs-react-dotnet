import { useEffect, useState } from "react";
import '../stylesheets/clientAccounts.css';
import Navbar from '../components/adminPanelNavbar';
import { useNavigate } from "react-router-dom";
import api from "../queryClientProvider";
import type { Account } from "../interfaces/Account";

function clientAccounts() {
    let [accounts, setAccounts] = useState<Account[]>([]);
    const [usableAccounts, setUsableAccounts] = useState<Account[]>([]);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        const callApi = async () => {
            try {
                const response = await api.get("api/Account");
                const data = response.data;
                console.log(data);
                setAccounts(data);
                setUsableAccounts(data);
            } catch (error) {
                console.log("Error " + error);
            }
        }
        callApi();
    }, []);

    async function search(keyword: string) {
        if (keyword.trim()) {
            const data = (await api.get(`api/Account/search/${keyword}`));
            const searchedAccounts = data.data;
            setUsableAccounts(searchedAccounts);
        }
        else {
            setUsableAccounts(accounts);
        }
    }

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
    const createAccount = () => {
        navigate('/CreateAccount');
    }

    const accountDetails = (account: Account) => {
        navigate("/accountDetails", {
            state: { account }
        });
    };

    return (
        <div className="register-layout">
            <Navbar />
            <div className="main-content">
                <div className="dashboard-top">
                    <div className="dashboard-title">Client Accounts</div>
                    <button className="create-account-button" onClick={() => createAccount()}>+ Create Account</button>
                </div>
                <div id="searchBar">
                    <input id="input" type="text" placeholder='Search by account name...' value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                    <button className="patientTableButton" id='searchButton' onClick={() => search(keyword)}>Search</button>
                </div>
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
                            {usableAccounts.map((account: Account) => (
                                <tr key={account.accountId}>
                                    <td className="dahboard-account-name">{account.accountName}</td>
                                    <td className="dahboard-account-id">{account.accountId}</td>
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
                                    <td className="dahboard-account-creation-date">{new Date(account.updatedAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    <td className="dashboard-manage-button-column">
                                        <button className="dashboard-manage-button" onClick={() => accountDetails(account)}>Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default clientAccounts;