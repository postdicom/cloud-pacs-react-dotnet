import "../stylesheets/login.css"
import { useState } from "react";
import Alert from "@mui/material/Alert";
import { usePatients } from "../hooks/usePatients";
import { useNavigate } from "react-router-dom";
import api from "../queryClientProvider";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    let [isCreditentialsValid, setCreditentialValidity] = useState(true);

    const navigate = useNavigate();
    const home = () => {
        navigate("/patientList");
        window.location.reload();
    };

    let handleSubmit = async (e: React.ChangeEvent<any>) => {
        try {
            setCreditentialValidity(true);
            e.preventDefault();
            const details = { email, password, role };

            const response = await api.post("api/Auth/Login", {
                method: 'POST',
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(details)
            })
            try {
                const data = await response.data;
                localStorage.setItem("token", data.token);
            }
            catch (error) {
                console.error(error);
            }
        }

        catch (error) {
            setCreditentialValidity(false);
            console.error(error);
        }
    }

    return <>
        <form onSubmit={handleSubmit}>
            <div className="login-box">
                <div className="loginContainer">
                    <div className="loginHeader">
                        <div id="loginHeader">CloudPACS</div>
                        <div id="login-sub-header">Sign in to continue</div>
                    </div>

                    <div>
                        <div className="section">Welcome back</div>
                        <div className="loginBody">Enter your credentials to access the viewer.</div>
                    </div>

                    <div className="textbox-header">Email address</div>
                    <input
                        className="textFields"
                        placeholder="jane@hospital.org"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                    <div className="textbox-header">Password</div>
                    <input
                        className="textFields"
                        placeholder="••••••••"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                    <div id="forgotPassword">Forgot Password?</div>
                    <button onClick={home} id="signInButton">Sign in</button>
                    <div>
                        {!isCreditentialsValid &&
                            <div>
                                <div className="auth-divider"></div>
                                <Alert id="wrongCreditentialWarning" severity="error">
                                    <div id="warningHeader"> Wrong credentials:</div>
                                    <div id="warningBody">"Invalid email or password."</div>
                                </Alert>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </form>
    </>
}

export default Login