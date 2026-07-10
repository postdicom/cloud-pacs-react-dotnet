import { Grid, TextField } from "@mui/material"
import "../stylesheets/login.css"
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
                        <div className="section">Welcome back</div>
                        <div className="body">Enter your credentials to access the viewer.</div>
                    </div>

                    <div className="textbox-header">Email address</div>
                    <input
                        className="textFields"
                        placeholder="jane@hospital.org"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}/>
                    <div className="textbox-header">Password</div>
                    <input
                        className="textFields"
                        placeholder="••••••••"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}/>
                    <div id="forgotPassword">Forgot Password?</div>
                    <button id="signInButton">Sign in</button>
                </div>
            </div>
        </form>
    </>
}

export default Login