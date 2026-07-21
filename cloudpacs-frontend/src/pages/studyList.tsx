import { useState } from "react";
import "../stylesheets/studylist.css";
import Navbar from '../components/navbar';

const studiesData = [
    { date: "14/Jul/2026", desc: "Brain MRI w/ contrast", mod: "MR", series: 4, images: 320, modColor: "#F3E5F5", modText: "#6A1B9A" },
    { date: "02/Jun/2026", desc: "Chest CT", mod: "CT", series: 2, images: 180, modColor: "#E3F2FD", modText: "#1565C0" },
    { date: "02/Jun/2026", desc: "Chest CT follow-up", mod: "CT", series: 3, images: 220, modColor: "#E3F2FD", modText: "#1565C0" },
    { date: "18/May/2026", desc: "Chest X-ray", mod: "CR", series: 1, images: 2, modColor: "#FFF3E0", modText: "#E65100" },
];
const accessLog = [
    { user: "John Doe", study: "Brain MRI w/ contrast", action: "Viewed", timeStamp: "17-Jul-2026, 09:14", modColor: "#E3F2FD", modText: "#1565C0"},
    { user: "John Doe", study: "Chest CT", action: "Viewed", timeStamp: "17-Jul-2026, 09:14", modColor: "#E3F2FD", modText: "#1565C0"},
    { user: "Sara Kim", study: "Brain MRI w/ contrast", action: "Viewed", timeStamp: "17-Jul-2026, 09:14", modColor: "#E3F2FD", modText: "#1565C0"},
    { user: "John Doe", study: "Brain MRI w/ contrast", action: "Uploaded", timeStamp: "17-Jul-2026, 09:14", modColor: "#d1fae5", modText: "#076046"}
];

function Register() {
    const [activeTab, setActiveTab] = useState("Switch");
    return (
        <div className="register-layout">
            <Navbar />
            <div className="main-content">
                <div className="patient-header">
                    <div className="patient-name-container">
                        <div className="patient-name-title">Smith, Jane A.</div>
                        <div className="patient-info-text">
                            MRN-00421 &middot; DOB: 1974-03-22 &middot; F &middot; 4 studies
                        </div>
                    </div>
                    <button className="all-patients-btn">
                        <button> All patients </button>
                    </button>
                </div>
                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === "Studies" ? "active" : ""}`}
                        onClick={() => setActiveTab("Studies")}
                    >
                        Studies
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "Access Log" ? "active" : ""}`}
                        onClick={() => setActiveTab("Access Log")}
                    >
                        Access Log
                    </button>
                </div>

                {activeTab === "Studies" && (
                    <table className="studies-table">
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>DESCRIPTION</th>
                                <th>MOD</th>
                                <th>SERIES</th>
                                <th>IMAGES</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {studiesData.map((row, index) => (
                                <tr key={index}>

                                    <td className="date-cell">
                                        {row.date.split(' ').map((text, i) => (
                                            <div key={i}>{text}</div>
                                        ))}
                                    </td>

                                    <td className="desc-cell">{row.desc}</td>

                                    <td>
                                        <span
                                            className="mod-chip"
                                            style={{ backgroundColor: row.modColor, color: row.modText }}
                                        >
                                            {row.mod}
                                        </span>
                                    </td>

                                    <td className="number-cell">{row.series}</td>

                                    <td className="number-cell">{row.images}</td>

                                    <td style={{ textAlign: 'right' }}>
                                        <button className="open-btn">
                                            Open
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {activeTab === "Access Log" && (
                    <div className="access-log-wrapper">
                        <div className="access-log-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, color: '#4A5568', fontSize: 25}}>ACCESS LOG</h3>
                            <div className="filter-container">
                                <label htmlFor="studyFilter" style={{ marginRight: '8px', color: '#4A5568' }}>Filter by study:</label>
                                <select id="studyFilter" className="studySort" defaultValue="All studies">
                                    <option value="All studies">All studies</option>
                                    <option value="Brain MRI">Brain MRI w/ contrast</option>
                                    <option value="Chest CT">Chest CT</option>
                                    <option value="Chest X-ray">Chest X-ray</option>
                                </select>
                            </div>
                        </div>
                        <table className="studies-table">
                            <thead>
                                <tr>
                                    <th>USER</th>
                                    <th>STUDY</th>
                                    <th>ACTION</th>
                                    <th>TIMESTAMP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accessLog.map((row, index) => (
                                    <tr key={index}>
                                        <td className="user-cell">
                                            {row.user.split(' ').map((text, i) => (
                                                <span key={i} style={{ marginRight: '4px' }}>{text}</span>
                                            ))}
                                        </td>
                                        <td className="study-cell">{row.study}</td>
                                        <td>
                                            <span
                                                className="action-chip"
                                                style={{ 
                                                    backgroundColor: row.modColor || '#E8EAF6', 
                                                    color: row.modText || '#3F51B5',
                                                    padding: '4px 12px',
                                                    borderRadius: '16px',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                {row.action}
                                            </span>
                                        </td>
                                        <td className="time-stamp-cell">{row.timeStamp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '0.85rem', color: '#718096' }}>
                            4 events &middot; append-only log
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Register;