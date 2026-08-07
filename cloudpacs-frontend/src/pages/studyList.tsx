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
    let [filteredAuditLog, setFilteredAuditLog] = useState<AuditLogEntry[]>(usableAuditLog);
    let [selectedFilter, setSelectedFilter] = useState("All Studies");
    let [existingMods, setExistingMods] = useState<string[]>([]);

    const modColours = {
        MR: "#F3E5F5",
        CT: "#E3F2FD",
        CR: "#FFF3E0"
    };
    const getModColour = (mod) => modColours[mod];

    const actionSettings = [
        { action: "2", label: "Viewed", modColor: "#1e40af", modText: "#dbeafe" },
        { action: "3", label: "Uploaded", modColor: "#065f46", modText: "#d1fae5" },
    ]

    const getActionSetting = (action: string | number) =>
        actionSettings.find((item) => Number(item.action) === Number(action));

    const actionLabel = (action: string) => getActionSetting(action)?.label ?? "";
    const actionModColor = (action: string) => getActionSetting(action)?.modColor ?? "";
    const actionModText = (action: string) => getActionSetting(action)?.modText ?? "";

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
                    setExistingMods((prev) => prev.includes(record.studyDetail) ? prev : [...prev, record.studyDetail]);
                });
            } catch (error) {
                console.log("Error " + error);
            }
        }
        callApi();
    }, []);

    function filterAuditLog(value) {
        setSelectedFilter(value);

        const updatedAuditLog = usableAuditLog.filter((entry) => {
            if (value === "All Studies") return true;
            return entry.studyDetail === value;
        });
        filteredAuditLog.filter((entry) => entry.studyDetail === selectedFilter)
        setFilteredAuditLog(updatedAuditLog);
    }

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
                                <select value={selectedFilter} onChange={(e) => filterAuditLog(e.target.value)} id="studyFilter" className="studySort">
                                    <option value="All Studies">All Studies</option>
                                    {existingMods.map((studyDetail) => (studyDetail.trim() &&
                                        <option key={studyDetail} value={studyDetail}>{studyDetail}</option>
                                    ))}
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
                                    {filteredAuditLog.map((row: AuditLogEntry) => (row.studyDetail.trim() &&
                                        <tr key={row.id}>
                                            <td className="user-cell"> {row.userName}
                                            </td>
                                            <td className="study-cell">{row.studyDetail}</td>
                                            <td>
                                                <span
                                                    className="action-chip"
                                                    style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '16px',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.85rem',
                                                        color: actionModColor(row.action),
                                                        backgroundColor: actionModText(row.action)
                                                    }}
                                                >
                                                    {actionLabel(row.action)}
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