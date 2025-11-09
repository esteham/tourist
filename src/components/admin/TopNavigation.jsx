import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUserShield, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../AuthContext';

const TopNavigation = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login'); // Or redirect to login
  }

  return (
    <nav 
      className="navbar navbar-expand bg-white border-bottom px-4" 
      style={{ 
        height: '70px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 999
      }}
    >
      <div className="container-fluid p-0">
        <ul className="navbar-nav ms-auto align-items-center">
          <li className="nav-item me-3">
            <Link to="/" className="nav-link d-flex align-items-center" style={{ color: '#4e73df' }}>
              <FontAwesomeIcon icon={faHome} className="me-2" />
              <span className="d-none d-md-inline">View Site</span>
            </Link>
          </li>
          
          <li className="nav-item dropdown">
            <a 
              className="nav-link dropdown-toggle d-flex align-items-center" 
              href="#" 
              id="navbarDropdown" 
              role="button" 
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ color: '#5a5c69' }}
            >
              <div className="position-relative me-2">
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: '#4e73df',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '1.1rem'
                }}>
                  {user.username?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
              <div className="d-none d-md-block">
                <div style={{ fontWeight: '600' }}>
                  {user.username || user.name}
                </div>
              </div>
            </a>
            
            <ul 
              className="dropdown-menu dropdown-menu-end shadow border-0" 
              aria-labelledby="navbarDropdown"
              style={{
                minWidth: '220px',
                borderRadius: '0.35rem',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <li>
                <Link to="/admin-profile" className="dropdown-item d-flex align-items-center py-2">
                  <FontAwesomeIcon icon={faUserShield} className="me-2 text-gray-500" />
                  Edit Profile
                </Link>
              </li>
              <li>
                <Link to="/change-password" className="dropdown-item d-flex align-items-center py-2">
                  <FontAwesomeIcon icon={faCog} className="me-2 text-gray-500" />
                  Change Password
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider my-1" />
              </li>
              <li>
                <button 
                  className="dropdown-item d-flex align-items-center py-2 text-danger"
                  onClick={handleLogout}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                      Logout
                    </>
                  )}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default TopNavigation;