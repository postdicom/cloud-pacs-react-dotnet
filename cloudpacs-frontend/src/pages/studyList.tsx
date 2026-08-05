import { useEffect, useState } from "react";
import "../stylesheets/studylist.css";
import Navbar from '../components/navbar';
import { useLocation, useNavigate } from "react-router-dom";
import api from "../queryClientProvider";
import type { Study } from "../interfaces/Study";
import type { AuditLogEntry } from "../interfaces/AuditLogEntry";


const accessLog = [
    { user: "John Doe", study: "Brain MRI w/ contrast", action: "Viewed", timeStamp: "17-Jul-2026, 09:14", modColor: "#E3F2FD", modText: "#1565C0" },
    { user: "John Doe", study: "Chest CT", action: "Viewed", timeStamp: "17-Jul-2026, 09:14", modColor: "#E3F2FD", modText: "#1565C0" },
    { user: "Sara Kim", study: "Brain MRI w/ contrast", action: "Viewed", timeStamp: "17-Jul-2026, 09:14", modColor: "#E3F2FD", modText: "#1565C0" },
    { user: "John Doe", study: "Brain MRI w/ contrast", action: "Uploaded", timeStamp: "17-Jul-2026, 09:14", modColor: "#d1fae5", modText: "#076046" }
];

function Register() {
    const [activeTab, setActiveTab] = useState("Studies");
    let [studies, setStudies] = useState([]);
    let [usableStudies, setUsableStudiesList] = useState<Study[]>([]);
    let [auditLog, setAuditLog] = useState([]);
    let [usableAuditLog, setUsableAuditLog] = useState<AuditLogEntry[]>([]);

    const modColours = {
        MR: "#F3E5F5",
        CT: "#E3F2FD",
        CR: "#FFF3E0"
    };
    const getModColour = (mod) => modColours[mod];

    const location = useLocation();
    const patient = location.state?.patient;

    const navigate = useNavigate();
    const dicomViewer = (study) => {
        navigate("/dicomViewer", {
            state: { study: study, patient: patient },
        });
    };

    const patients = () => {
        navigate("/patientList");
    };


    useEffect(() => {
        const callApi = async () => {
            try {
                const data = await api.get(`api/v1/patients/${patient.mrn}/studies`);
                studies = data.data;
                Array.from(studies).forEach(element => {
                    const study: Study = element;
                    setUsableStudiesList((prev) => [...prev, study]);
                });

                const auditLogData = await api.get("api/Auth/auditLog");
                auditLog = auditLogData.data
                Array.from(auditLog).forEach(element => {
                    const record: AuditLogEntry = element;
                    setUsableAuditLog((prev) => [...prev, record]);
                });



            } catch (error) {
                console.log("Error " + error);
            }
        }
        callApi();
    }, []);

    return (
        <div className="register-layout">
            <Navbar />
            <div className="main-content">
                <div className="patient-header">
                    <div className="patient-name-container">
                        <div className="patient-name-title">{patient.name}</div>
                        <div className="patient-info-text">
                            {patient.mrn} &middot; DOB: {patient.doB} &middot; {patient.gender} &middot; {patient.numOfStudies}
                        </div>
                    </div>
                    <button className="all-patients-btn" onClick={() => patients()}>
                        All patients
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
                            {usableStudies.map((row: Study) => (
                                <tr key={row.patientGuid}>

                                    <td className="date-cell">
                                        {row.date.split(' ').map((text, i) => (
                                            <div key={i}>{text}</div>
                                        ))}
                                    </td>

                                    <td className="desc-cell">{row.studyDescription}</td>

                                    <td>
                                        <span
                                            className="mod-chip"
                                            style={{ backgroundColor: getModColour(row), color: row.mod }}
                                        >
                                            {row.mod}
                                        </span>
                                    </td>

                                    <td className="number-cell">{row.series}</td>

                                    <td className="number-cell">{row.imageCount}</td>

                                    <td style={{ textAlign: 'right' }}>
                                        <button className="open-btn" onClick={() => dicomViewer(row)}>
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
                            <h3 style={{ margin: 0, color: '#4A5568', fontSize: 25 }}>ACCESS LOG</h3>
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
                        <div className="scroll">
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
                                    {usableAuditLog.map((row: AuditLogEntry) => (
                                        <tr key={row.id}>
                                            <td className="user-cell"> {row.userName}
                                                {/* {row.userId.split(' ').map((text, i) => (
                                                <span key={i} style={{ marginRight: '4px' }}>{text}</span>
                                            ))} */}
                                            </td>
                                            <td className="study-cell">{/* {row.study} */}</td>
                                            <td>
                                                <span
                                                    className="action-chip"
                                                    style={{
                                                        /* backgroundColor: row.modColor || '#E8EAF6',
                                                        color: row.modText || '#3F51B5', */
                                                        padding: '4px 12px',
                                                        borderRadius: '16px',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {row.resourceId}
                                                </span>
                                            </td>
                                            <td className="time-stamp-cell">{row.timestamp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '0.85rem', color: '#718096' }}>
                            {usableAuditLog.length} events &middot; append-only log
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Register;