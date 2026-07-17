import Pagination from "@mui/material/Pagination"
import Navbar from "../components/navbar.tsx"
import "../stylesheets/patientList.css"
import Typography from "@mui/material/Typography"
import { useState } from "react";

function patientList() {
    const [page, setPage] = useState<number>(1);
    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    return <>
        <div className='patientListContainer'>
            <div className="navbar"><Navbar /></div>
            <div className='mainPage'>
                <div id='patientListHeader'>Patients</div>
                <div id='patientTable'>
                    <div id="searchBar">
                        <input id="input" type="text" placeholder='Search by name, MRN, or date of birth' />
                        <button className="patientTableButton" id='filtersButton'>Filters</button>
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
                                <tr>
                                    <th className="patientName" scope="row">Smith, Jane A.</th>
                                    <td className="mrnRow">MRN-00421</td>
                                    <td>1974-03-22</td>
                                    <td>14 Jul 2026</td>
                                    <td>3</td>
                                </tr>
                                <tr>
                                    <th className="patientName" scope="row">Johnson, Robert</th>
                                    <td className="mrnRow">MRN-00389</td>
                                    <td>1958-11-07</td>
                                    <td>02 Jul 2026</td>
                                    <td>7</td>
                                </tr>
                                <tr>
                                    <th className="patientName" scope="row">Patel, Anika</th>
                                    <td className="mrnRow">MRN-00512</td>
                                    <td>1991-06-14</td>
                                    <td>28 Jun 2026</td>
                                    <td>1</td>
                                </tr>
                            </tbody>
                        </table>
                        <div id="patientListPagination">
                            <Typography id="pageSelection">Showing {page * 3} of all patients</Typography>
                            {/* <Pagination count={10} onChange={handlePageChange} page={page} size="small" /> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default patientList