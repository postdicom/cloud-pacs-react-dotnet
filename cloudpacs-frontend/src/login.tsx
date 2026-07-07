import { Grid, TextField } from "@mui/material"
import "./login.css"
import { useState } from "react";

function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    let handleSubmit = (e: React.ChangeEvent<any>) => {
        e.preventDefault();
        const details = {email, password};

        fetch("http://localhost:5000/api/test",{
            method: 'POST',
            headers: { "Content-type": "application/json"},
            body: JSON.stringify(details)
        })
    }

    return <>
        <form onSubmit={handleSubmit}>
            <div className="login-box">
                <div className="container">
                    <div className="header">
                        <div id="header">CloudPACS</div>
                        <div id="sub-header">Sign in to continue</div>
                    </div>

                    <div>
                        <div className="section">Welcome Back</div>
                        <div className="body">Enter your credentials to access the viewer.</div>
                    </div>

                    <div className="textbox-header">Email address</div>
                    <TextField
                        className="textFields"
                        placeholder="jane@hospital.org"
                        variant="outlined"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}/>
                    <div className="textbox-header">Password</div>
                    <TextField
                        className="textFields"
                        placeholder="------"
                        variant="outlined"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}/>
                    <button id="signInButton">Sign in</button>
                </div>
            </div>
        </form>
    </>
}

export default Login