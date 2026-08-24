import '../stylesheets/createAccount.css';
import Navbar from '../components/adminPanelNavbar';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { color } from '@mui/system';
import { Checkbox, FormControlLabel } from '@mui/material';
import api from '../queryClientProvider';

function createAccount() {
    const [email, setEmail] = useState<string>('');
    const [accountName, setAccountName] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [totalStorage, setTotalStorage] = useState(0);
    const [internalNotes, setInternalNotes] = useState<string>();
    const [slug, setSlug] = useState<string>('');
    const [password, setPassword] = useState("");
    const [checked, setChecked] = useState(false);

    const handleEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    }

    const handleAccountName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAccountName(event.target.value);
    }

    const handleFirstName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstName(event.target.value);
    }

    const handleLastName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLastName(event.target.value);
    }

    useEffect(() => {
        setUserName(firstName + " " + lastName);
    }, [firstName, lastName]);

    const handleTotalStorage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTotalStorage(parseInt(event.target.value, 10));
    };

    const handleInternalNotes = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInternalNotes(event.target.value);
    }

    useEffect(() => {
        setSlug(accountName.trim().toLowerCase().replaceAll(" ", "-"))
    }, [accountName]);

    const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };

    const generatePassword = () => {
        let charset = "!@#$%^&*()0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let newPassword = "";

        for (let i = 0; i < 12; i++) {
            newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        setPassword(newPassword);
    };

    const navigate = useNavigate();
    const dashboard = () => {
        navigate('/Dashboard');
    }

    let handleSubmit = async (e: React.ChangeEvent<any>) => {
        try {
            e.preventDefault();

            const response = await api.post("api/Auth/Register", {
                "email": email,
                "accountName": accountName,
                "userName": userName,
                "password": password,
                "totalStorage": totalStorage,
                "internalNotes": internalNotes,
                "slug": slug
            });
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <div className="container">
                <Navbar />
                <div className="create-account-block scroll">
                    <div className="create-account-header">
                        <h4 style={{ color: 'black' }}>New Client Account</h4>
                        {/* <div className='create-account-info'>Fields marked * are required. The client will receive a welcome email with login instructions.</div> */}
                    </div>
                    <div className="create-account-details">
                        <div className='create-account-title'>ACCOUNT DETAILS</div>
                        <div className='create-account-subtitle'>Account Name *</div>
                        <input className="create-account-input" type="text" onChange={handleAccountName} />
                        {/* <div className='create-account-info'>The display name shown to all users in this account.</div> */}

                        <div className='create-account-subtitle'>Subdomain / Slug *</div>
                        <input className="create-account-input" type="text" readOnly value={slug} />
                        {/*<div className='create-account-info'>Auto-generated from account name. Used in audit logs and the API path. Lowercase, hyphens only.</div> */}

                        <div className='plan-storage-section'>
                            <div className='plan-storage-section-component'>
                                <div className='create-account-subtitle'>Plan *</div>
                                <select className="create-account-input">
                                    <option value="standard">Standard</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div className='plan-storage-section-component'>
                                <div className='create-account-subtitle'>Storage Quota *</div>
                                <input className="create-account-input" type="number" onChange={handleTotalStorage} />
                            </div>
                        </div>

                        <div className='create-account-subtitle'>Internal Notes</div>
                        <textarea className='create-account-textarea' placeholder='e.g. NHS trust, procurement contact: sarah.jones@nhs.uk' name="" id="" onChange={handleInternalNotes}></textarea>
                        {/* <div className='create-account-info'>Visible to Console admins only — never shown to the client.</div> */}

                        <div className='create-account-title'>ACCOUNT ADMIN USER</div>
                        {/* <div className='create-account-info'>This person will be the first user of the account, with Account Admin role. They can then invite additional users from CloudPACS.</div> */}
                        <div className='plan-storage-section'>
                            <div className='plan-storage-section-component'>
                                <div className='create-account-subtitle'>First Name *</div>
                                <input className="create-account-input" type="text" value={firstName} onChange={handleFirstName}/>
                            </div>
                            <div className='plan-storage-section-component'>
                                <div className='create-account-subtitle'>Last Name *</div>
                                <input className="create-account-input" type="text" value={lastName} onChange={handleLastName}/>
                            </div>
                        </div>
                        <div className='create-account-subtitle'>Email Address *</div>
                        <input className="create-account-input" type="email" onChange={handleEmail} />
                        {/* <div className='create-account-info'>Used as the login email in CloudPACS. Must be unique across all accounts.</div> */}
                        <div className='create-account-subtitle'>Temporary Password *</div>
                        <div className='plan-storage-section'>
                            <input className="create-account-input" type="text" value={password} readOnly />
                            <button id='create-account-generate-password-button' onClick={() => generatePassword()}>Generate</button>
                        </div>
                        <div className='plan-storage-section'>
                            <FormControlLabel required control={<Checkbox onChange={handleCheck} />} label={`Send welcome email to ${email} with login URL and temporary password`} />
                        </div>


                    </div>
                    <div className="create-account-bottom">
                        <div className='plan-storage-section'>
                            <div>
                                <div>Account will be created with status</div>
                                <div style={{ color: 'green' }}>Active</div>
                            </div>
                            <>
                                <button id='create-account-cancel-button' onClick={() => dashboard()}>Cancel</button>
                                <button id='create-account-button' onClick={handleSubmit}>Create Account</button>
                            </>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default createAccount;