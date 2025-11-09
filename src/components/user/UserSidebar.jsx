import React from 'react';
import { NavLink } from 'react-router-dom';

const UserSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'bi bi-speedometer2', label: 'Dashboard' },
    { id: 'bookings', icon: 'bi bi-calendar-check', label: 'My Bookings' },
    { id: 'profile', icon: 'bi bi-person', label: 'Profile' },
  ];

  return (
    <div 
      className={`bg-dark text-white position-fixed h-100 ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}
      style={{ 
        width: sidebarOpen ? '250px' : '80px',
        transition: 'width 0.3s ease',
        zIndex: 1000
      }}
    >
      <div className="p-3 d-flex align-items-center justify-content-between">
        {sidebarOpen && <h5 className="mb-0">Tourist Agency</h5>}
        <button 
          className="btn btn-link text-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <i className={`bi bi-${sidebarOpen ? 'arrow-left' : 'arrow-right'}`}></i>
        </button>
      </div>
      
      <hr className="my-0 bg-secondary" />
      
      <ul className="nav flex-column mt-3">
        {menuItems.map(item => (
          <li className="nav-item" key={item.id}>
            <NavLink
              className={`nav-link d-flex align-items-center ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{ 
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.25rem',
                margin: '0.25rem 1rem'
              }}
            >
              <i className={`${item.icon} me-3`}></i>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSidebar;