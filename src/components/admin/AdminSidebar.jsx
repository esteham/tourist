import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faUsers, faCalendarAlt, faSuitcase, 
  faMapMarkedAlt, faComments, faCog, faBars, faEnvelope,
  faChartBar, faCreditCard, faLifeRing // New icons
} from '@fortawesome/free-solid-svg-icons';


const AdminSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  return (
    <div 
      className={`bg-dark text-white ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`} 
      style={{ 
        width: sidebarOpen ? '250px' : '80px', 
        transition: 'all 0.3s ease',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}
    >
      {/* Sidebar Header */}
      <div 
        className="p-3 d-flex justify-content-between align-items-center" 
        style={{ 
          height: '65px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.2)'
        }}
      >
        {sidebarOpen ? (
          <h4 className="m-0" style={{ 
            color: '#fff',
            fontWeight: '600',
            fontSize: '1.2rem',
            letterSpacing: '0.5px'
          }}>
            Admin Panel
          </h4>
        ) : (
          <div style={{ width: '24px' }}></div> 
        )}
        <button 
          className="btn btn-link text-white p-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
          style={{ minWidth: '30px' }}
        >
          <FontAwesomeIcon icon={faBars} size={sidebarOpen ? undefined : "lg"} />
        </button>
      </div>
      
      {/* Sidebar Menu Items */}
      <div 
        className="sidebar-sticky pt-3" 
        style={{ 
          height: 'calc(100vh - 65px)',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.2) transparent'
        }}
      >
        <ul className="nav flex-column">
          {[
            { tab: 'dashboard', icon: faChartLine, label: 'Dashboard' },
            { tab: 'users', icon: faUsers, label: 'Users' },  
            { tab: 'destinations', icon: faMapMarkedAlt, label: 'Destinations' },
            { tab: 'packages', icon: faSuitcase, label: 'Packages' }, 
            { tab: 'bookings', icon: faCalendarAlt, label: 'Bookings' }, 
            { tab: 'admin/payments', icon: faCreditCard, label: 'Payments' },     
            { tab: 'testimonials', icon: faComments, label: 'Testimonials' },
            { tab: 'reports', icon: faChartLine, label: 'Reports' },   
            { tab: 'contact-management', icon: faEnvelope, label: 'Contact Messages' },        
            { tab: 'about', icon: faLifeRing, label: 'About' },         
            { tab: 'settings', icon: faCog, label: 'Settings' }
          ].map((item) => (
            <li className="nav-item" key={item.tab}>
              <button 
                className={`nav-link text-start btn btn-link text-white w-100 d-flex align-items-center 
                  ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => setActiveTab(item.tab)}
                style={{
                  padding: '1.4rem 1.5rem',
                  borderRadius: '0',
                  borderLeft: activeTab === item.tab ? '4px solid #4e73df' : '4px solid transparent',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === item.tab ? 'rgba(78, 115, 223, 0.15)' : 'transparent',
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={sidebarOpen ? "me-3" : "mx-auto"} 
                  style={{
                    fontSize: '1.1rem',
                    color: activeTab === item.tab ? '#4e73df' : 'rgba(255,255,255,0.8)'
                  }}
                />
                {sidebarOpen && (
                  <span style={{
                    color: activeTab === item.tab ? '#fff' : 'rgba(255,255,255,0.8)',
                    fontWeight: activeTab === item.tab ? '500' : '400',
                    transition: 'all 0.2s'
                  }}>
                    {item.label}
                  </span>
                )}
                {activeTab === item.tab && (
                  <span 
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#4e73df',
                      borderRadius: '50%',
                      display: sidebarOpen ? 'block' : 'none'
                    }}
                  ></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminSidebar;