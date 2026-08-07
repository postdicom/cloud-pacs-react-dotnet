import { useNavigate } from "react-router-dom";
import "../stylesheets/unAuthorizedWarning.css"

function unAuthorized() {
    const navigate = useNavigate();
    const login = () => {
        navigate("/Login");
    };

    return <>
        <div id="notFoundContainer">
            <div id="lostMessage">
                You are not authorized for this action
            </div>
            <button id="goBackToLogin" onClick={() => login()}> Go to Login </button>
        </div>
    </>
}

export default unAuthorized