import Pagination from "@mui/material/Pagination"
import Navbar from "../components/navbar.tsx"
import "../stylesheets/patientList.css"
import Typography from "@mui/material/Typography"
import { useEffect, useState } from "react";
import api from "../queryClientProvider.tsx";
import { useNavigate } from "react-router-dom";
import type { Patient } from "../interfaces/Patient.tsx";

function patientList() {
    const [page, setPage] = useState<number>(1);
    const [usablePatientsList, setUsablePatientsList] = useState<Patient[]>([]);
    const [searchedPatientList, setSearchedPatientList] = useState<Patient[]>([]);
    let [patients, setPatients] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [searchActive, setSearchActive] = useState(false);
    const [numberOfPatients, setNumberOfPatients] = useState(0);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };


    useEffect(() => {
        const callApi = async () => {
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

        callApi();
    }, []);

    async function search(keyword: string) {
        if (keyword) {
            const data = (await api.get(`api/Patients/search/${keyword}`));
            patients = data.data;
            if (patients.length === 0) {
                setSearchedPatientList([])
            }
            setSearchActive(true);
            Array.from(patients).forEach(element => {
                const patient: Patient = element;
                setSearchedPatientList((prev) => prev.some((p) => p.mrn === patient.mrn) ? prev : [...prev, patient]);
            });
            setNumberOfPatients(() => patients.length);
        }
        else {
            setSearchActive(false);
            setNumberOfPatients(() => usablePatientsList.length);
        }
    }

    const navigate = useNavigate();
    const studyList = (patient) => {
        navigate("/studyList", {
            state: { patient }
        });
    };

    return <>
        <div className='patientListContainer'>
            <div className="navbar"><Navbar /></div>
            <div className='mainPage'>
                <div id='patientListHeader'>Patients</div>
                <div id='patientTable'>
                    <div id="searchBar">
                        <input id="input" type="text" placeholder='Search by name, MRN, or date of birth' value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                        <button className="patientTableButton" id='filtersButton'>Filters</button>
                        <button className="patientTableButton" id='searchButton' onClick={() => search(keyword)}>Search</button>
                    </div>
                    <div>
                        <table id="patientTable">
                            <thead>
                                <tr>
                                    <th scope="col">PATIENT NAME</th>
                                    <th scope="col">MRN</th>
                                    <th scope="col">DOB</th>
                                    <th scope="col">LAST STUDY</th>
                                    <th scope="col">STUDIES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!searchActive && usablePatientsList.map((patient: Patient) => (
                                    <tr key={patient.mrn} onClick={() => studyList(patient)}>
                                        <th className="patientName" scope="row">{patient.name}</th>
                                        <td className="mrnRow">{patient.mrn}</td>
                                        <td>{patient.dob}</td>
                                        <td>{new Date().toLocaleDateString()}</td>
                                        <td>{patient.numOfStudies}</td>
                                    </tr>
                                ))}

                                {searchActive && searchedPatientList.map((patient: Patient) => (
                                    <tr key={patient.mrn} onClick={() => studyList(patient)}>
                                        <th className="patientName" scope="row">{patient.name}</th>
                                        <td className="mrnRow">{patient.mrn}</td>
                                        <td>{patient.dob}</td>
                                        <td>{new Date().toLocaleDateString()}</td>
                                        <td>{patient.numOfStudies}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {numberOfPatients === 0 &&
                            <div className="noPatients">There are no patients</div>
                        }

                        {numberOfPatients != 0 && <div id="patientListPagination">
                            <Typography id="pageSelection">Showing {numberOfPatients} of all patients</Typography>
                            {/* <Pagination count={10} onChange={handlePageChange} page={page} size="small" /> */}
                        </div>}

                    </div>
                </div>
            </div>
        </div>
    </>
}

export default patientList