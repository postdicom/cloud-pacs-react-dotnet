import { colors, Grid, TextField } from "@mui/material"
import "../stylesheets/register.css"
import { useState } from "react";
function Register() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, checkPassword] = useState('');

    let handleSubmit = (e: React.ChangeEvent<any>) => {
        e.preventDefault();
        const details = { email, password };

        fetch("http://localhost:5000/api/test", {
            method: 'POST',
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(details)
        })
    }

    return <>
        <form onSubmit={handleSubmit}>
            <div className="register-box">
                <div className="container">
                    <div className="header">
                        <strong id="header">CloudPACS</strong>
                        <div id="sub-header">You have been invited!</div>
                    </div>

                    <div>
                        <div className="section">Accept invitation</div>
                        <div className="body">You have been invited to join
                            <strong id = "clinic"> CloudPACS Radiology Clinic </strong>
                            as a, 
                            <strong id = "role"> Radiologist</strong>
                            .
                        </div>
                    </div>
                    <div className="auth-divider"></div>

                    <div className="textbox-header">Email address</div>
                    <TextField
                        className="textFields"
                        placeholder="jane@hospital.org"
                        variant="outlined"
                        disabled
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                    <div className="textbox-header">Name</div>
                    <TextField
                        className="textFields"
                        placeholder="Jane Smith"
                        variant="outlined"
                        type="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)} />
                    <div className="textbox-header">Password</div>
                    <TextField
                        className="textFields"
                        placeholder="Min. 8 characters"
                        variant="outlined"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                    <div className="textbox-header">Confirm password</div>
                    <TextField
                        className="textFields"
                        placeholder="Repeat password"
                        variant="outlined"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => checkPassword(e.target.value)} />
                    <button id="registerButton">Accept invite</button>
                </div>
            </div>
        </form>
    </>
}
export default Register;