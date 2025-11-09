import React from 'react';
import { Dropdown } from 'react-bootstrap';

const UserTopNavigation = ({ userData, handleLogout, setSidebarOpen }) => {
  return (
    <header className="bg-white shadow-sm p-3 d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <button 
          className="btn btn-outline-secondary me-3"
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          <i className="bi bi-list"></i>
        </button>
        <h5 className="mb-0">User Dashboard</h5>
      </div>
      
      <Dropdown>
        <Dropdown.Toggle variant="light" id="dropdown-basic" className="d-flex align-items-center">
          {userData && (
            <>
              <div 
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: '36px', height: '36px' }}
              >
                {userData.username.charAt(0).toUpperCase()}
              </div>
              <span>{userData.username}</span>
            </>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={() => window.location.href = '/profile'}>
            <i className="bi bi-person me-2"></i> Profile
          </Dropdown.Item>
          <Dropdown.Item onClick={() => window.location.href = '/settings'}>
            <i className="bi bi-gear me-2"></i> Settings
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  );
};

export default UserTopNavigation;