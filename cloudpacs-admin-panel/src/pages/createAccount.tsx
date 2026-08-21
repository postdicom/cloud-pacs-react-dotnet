import '../stylesheets/createAccount.css';
import Navbar from '../components/adminPanelNavbar';

function createAccount() {
    return (
        <>
            <div className="container"><Navbar />
                <div className="create-account-block">

                    <div className="create-account-header">
                        <h4 style={{ color: 'black' }}>New Client Account</h4>
                        <div className='create-account-info'>Fields marked * are required. The client will receive a welcome email with login instructions.</div>
                    </div>
                    <div className="create-account-details">
                        <div className='create-account-title'>ACCOUNT DETAILS</div>
                        <div className='create-account-subtitle'>Account Name *</div>
                        <input className="create-account-input" type="text" />
                        <div className='create-account-info'>The display name shown to all users in this account.</div>

                        <div className='create-account-subtitle'>Subdomain / Slug *</div>
                        <input className="create-account-input" type="text" readOnly />
                        <div className='create-account-info'>Auto-generated from account name. Used in audit logs and the API path. Lowercase, hyphens only.</div>

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
                                <input className="create-account-input" type="number" />
                            </div>
                        </div>

                        <div className='create-account-subtitle'>Internal Notes</div>
                        <textarea className='create-account-textarea' placeholder='e.g. NHS trust, procurement contact: sarah.jones@nhs.uk' name="" id=""></textarea>
                        <div className='create-account-info'>Visible to Console admins only — never shown to the client.</div>

                        <div className='create-account-title'>ACCOUNT ADMIN USER</div>
                        <div>This person will be the first user of the account, with Account Admin role. They can then invite additional users from CloudPACS.</div>
                        <div className='plan-storage-section'>
                            <div className='plan-storage-section-component'>
                                <div className='create-account-subtitle'>First Name *</div>
                                <input className="create-account-input" type="text" />
                            </div>
                            <div className='plan-storage-section-component'>
                                <div className='create-account-subtitle'>Last Name *</div>
                                <input className="create-account-input" type="text" />
                            </div>
                        </div>
                        <div className='create-account-subtitle'>Email Address *</div>
                        <input className="create-account-input" type="text" />
                        <div className='create-account-info'>Used as the login email in CloudPACS. Must be unique across all accounts.</div>
                        <div className='plan-storage-section'>
                            <input type="checkbox" />
                            <label htmlFor="">Send welcome email to s.jones@brighton-radiology.nhs.uk with login URL and temporary password</label>
                        </div>
                        

                    </div>
                    <div className="create-account-bottom">

                    </div>
                </div>
            </div>
        </>
    )
}

export default createAccount;