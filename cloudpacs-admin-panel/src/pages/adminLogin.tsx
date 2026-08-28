import "../stylesheets/adminLogin.css"
import { useState } from "react";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import api from "../queryClientProvider";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    let [isCreditentialsValid, setCreditentialValidity] = useState(true);

    const navigate = useNavigate();
    const loggedIn = () => {
        navigate("/Dashboard");
    };

    let handleSubmit = async (e: React.ChangeEvent<any>) => {
        try {
            setCreditentialValidity(true);
            e.preventDefault();
            const details = { email, password };

            const response = await api.post("api/Auth/AdminLogin", {
                "email": email,
                "password": password
            });
            try {
                const data = await response.data;
                localStorage.setItem("token", data);
                loggedIn();
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
                    <div className="adminLoginHeader">
                        <div className="adminLoginHeaderHolder" id="adminLoginHeader">
                            <div>PostDICOM</div>
                            <div>Console</div>
                        </div>
                        <div id="admin-login-sub-header">Internal administration · PostDICOM B.V.</div>
                    </div>

                    <div>
                        <div className="section">Sign in</div>
                        <div className="adminLoginBody">Authorized personel only</div>
                    </div>

                    <div className="textbox-header">Email</div>
                    <input
                        className="textFields"
                        placeholder="admin@postdicom.com"
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
                    <button id="adminSignInButton">Sign in to Console</button>
                    <div className="adminWarning">This system is restricted to PostDICOM B.V. staff.</div>
                    <div className="adminWarning">Unauthorized access is prohibited.</div>
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