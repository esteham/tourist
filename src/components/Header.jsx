import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../logo.png';

const apiURL = process.env.REACT_APP_API_URL;

function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${apiURL}/backend/server/check_auth.php`, {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.authenticated) {
        setIsAuthenticated(true);
        setUser(result.user);
        localStorage.setItem('auth', JSON.stringify({
          isAuthenticated: true,
          user: {
            id: result.user.id,
            username: result.user.username, 
            email: result.user.email,
            role: result.user.role
          }
        }));
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('auth');
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiURL}/backend/server/logout.php`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const result = await response.json();

      if (result.success) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('auth');
        navigate('/login');
      } else {
        console.error('Logout failed:', result.message);
      }
    } catch (err) {
      console.error('Logout error:', err);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('auth');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <div className="container-fluid position-relative p-0">
        <nav className="navbar navbar-expand-lg navbar-light px-4 px-lg-5 py-3 py-lg-0">
          <Link to="/" className="navbar-brand p-0">
            <img src={logo} alt="Logo" style={{ height: '50px' }} />
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
            <span className="fa fa-bars" />
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav ms-auto py-0">
              <Link to="/about" className="nav-item nav-link">About</Link>
              <Link to="/contact" className="nav-item nav-link">Contact</Link>
              <Link to="/services" className="nav-item nav-link">Services</Link>
              <Link to="/packages" className="nav-item nav-link">Packages</Link>

              <Link to="/team" className="nav-item nav-link">Travel Guides</Link>
              
              {/*<div className="nav-item dropdown">
                <Link to="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">More</Link>
                <div className="dropdown-menu m-0">
                  <Link to="/destination" className="dropdown-item">Destination</Link>
                  <Link to="/team" className="dropdown-item">Travel Guides</Link>
                </div>
              </div>*/}
            </div>
            
            {isAuthenticated || localStorage.getItem('auth') ? (
              <div className="d-flex align-items-center">
                <div className="dropdown">
                  <button className="btn btn-outline-primary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown">
                    
                    {user?.username || user?.name || JSON.parse(localStorage.getItem('auth'))?.user?.name}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link 
                        className="dropdown-item" 
                        to="/user-dashboard?tab=profile"
                        onClick={() => {
                          localStorage.setItem('userDashboardActiveTab', 'dashboard');
                        }}
                      >
                      <i className="fas fa-user me-2"></i>
                        Profile
                      </Link>
                    </li>
                    {(user?.role === 'admin' || JSON.parse(localStorage.getItem('auth'))?.user?.role === 'admin') && (
                      <li><Link className="dropdown-item" to="/admin-dashboard">Admin Dashboard</Link></li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Logging out...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sign-out-alt me-2"></i>
                            Logout
                          </>
                        )}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary rounded-pill py-2 px-4 ms-3">
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Header;