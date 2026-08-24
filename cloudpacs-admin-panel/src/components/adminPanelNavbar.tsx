import React, { useState } from 'react';
import { useNavigate} from "react-router-dom";
import '../stylesheets/adminPanelNavbar.css';

const IconPlaceholder = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="4" />
  </svg>
);

const CloudPACS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('');


  const navigate = useNavigate();
  const changePage = (id: string) => {
    navigate('/' + id);
  }

  const navItems = [
    { id: 'Dashboard', label: 'Dashboard' },
    { id: 'ClientAccounts', label: 'Client Accounts' },
  ];

  return (
    <div className="app-container">
      <aside className="adminSidebar">
        <div className="sidebar-top">
          <div className="admin-brand-logo">
            {/* <span className="logo-full">CloudPACS</span> */}
            <span className="logo-collapsed">PostDICOM Console </span>
            <span className="logo-collapsed adminText">Internal admin</span>
          </div>

          <nav className="nav-menu">
            {navItems.map((item) => (

              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => changePage(item.id)}
                title={item.label}
              >
                <span className="icon">
                  <IconPlaceholder/>
                </span>
                <span className="nav-text">{item.label}</span>
              </button>

            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="user-profile" title="Sign out">
            <div className="avatar">JW</div>
            <div className="user-info">
              <div className="user-name">James Wilson</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CloudPACS;