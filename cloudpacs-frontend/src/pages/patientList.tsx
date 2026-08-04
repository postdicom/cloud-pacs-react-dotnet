import Pagination from "@mui/material/Pagination"
import Navbar from "../components/navbar.tsx"
import "../stylesheets/patientList.css"
import Typography from "@mui/material/Typography"
import { useEffect, useState } from "react";
import api from "../queryClientProvider.tsx";
import { useNavigate } from "react-router-dom";

function patientList() {
    const [page, setPage] = useState<number>(1);
    let [usablePatientsList, setUsablePatientsList] = useState([]);
    let [patients, setPatients] = useState([]);
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };


    useEffect(() => {
        const callApi = async () => {
            try {
                const data = (await api.get("api/Patients"));
                patients = data.data;
                Array.from(patients).forEach(patient => {
                    setUsablePatientsList((prev) => [...prev, patient]);
                });

            } catch (error) {
                console.log("Error " + error);
            }
        };

        callApi();
    }, []);
    console.log(usablePatientsList);

    async function search() {
        const el = document.querySelector<HTMLInputElement>('.input');
        const input = el?.value;
        const data = (await api.get(`api/Patients/search/${input}`));
        console.log(data);
    }

    //console.log(patients);

    /*     const displayPatients = async () => {
            const patients = await getPatients();
            const patientL = patients.map((patient: Patient) => patient);
        }; */

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
                        <input id="input" type="text" placeholder='Search by name, MRN, or date of birth' />
                        <button className="patientTableButton" id='filtersButton' onClick={() => search()}>Filters</button>
                        <button className="patientTableButton" id='searchButton'>Search</button>
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
                                {usablePatientsList.map((patient: any) => (
                                    <tr key={patient.id} onClick={() => studyList(patient)}>
                                        <th className="patientName" scope="row">{patient.name}</th>
                                        <td className="mrnRow">{patient.mrn}</td>
                                        <td>{patient.doB}</td>
                                        <td>{new Date().toLocaleDateString()}</td>
                                        <td>{patient.numOfStudies}</td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                        <div id="patientListPagination">
                            <Typography id="pageSelection">Showing {usablePatientsList.length} of all patients</Typography>
                            {/* <Pagination count={10} onChange={handlePageChange} page={page} size="small" /> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default patientList