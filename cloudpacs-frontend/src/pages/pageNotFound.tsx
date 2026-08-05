import { useNavigate } from "react-router-dom";
import "../stylesheets/pageNotFound.css"

function NotFound() {
    const navigate = useNavigate();
    const login = () => {
        navigate("/Login");
    };

    return <>
        <div id="notFoundContainer">
            <div id="lostMessage">
                The page you were looking for doesn't exist
            </div>
            <button id="goBackToLogin" onClick={() => login()}> Go to Login </button>
        </div>
    </>
}

export default NotFound