import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const apiURL = process.env.REACT_APP_API_URL;

const AdminProfile = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phone: '',
    currentPassword: '',
    newEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEmailChange, setShowEmailChange] = useState(false);
  const navigate = useNavigate();

  // Define handleChange function
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First check localStorage
        const authData = JSON.parse(localStorage.getItem('auth'));
        
        if (authData?.user) {
          setUserData({
            username: authData.user.username,
            email: authData.user.email,
            phone: authData.user.phone || '',
            currentPassword: '',
            newEmail: ''
          });
        }

        // Verify with server
        const response = await fetch(`${apiURL}/backend/server/check_auth.php`, {
          credentials: 'include'
        });
        const result = await response.json();

        if (result.authenticated && result.user) {
          const updatedUser = {
            username: result.user.username,
            email: result.user.email,
            phone: result.user.phone || '',
            currentPassword: '',
            newEmail: ''
          };

          setUserData(updatedUser);
          localStorage.setItem('auth', JSON.stringify({
            isAuthenticated: true,
            user: result.user
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${apiURL}/backend/server/update_user_profile.php`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userData.username,
            phone: userData.phone,
            ...(showEmailChange && {
              currentPassword: userData.currentPassword,
              newEmail: userData.newEmail
            }),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Update failed');
      }

      // Update local storage and state
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: result.user
      }));

      setUserData({
        username: result.user.username,
        email: result.user.email,
        phone: result.user.phone || '',
        currentPassword: '',
        newEmail: ''
      });

      setSuccess('Profile updated successfully!');
      setShowEmailChange(false);

      // Redirect after 2 seconds
      setTimeout(() => navigate('/admin-dashboard'), 1000);

    } catch (error) {
      console.error('Update error:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: "'Poppins', sans-serif", 
      backgroundColor: '#f8fafc', 
      color: '#1e293b', 
      minHeight: '100vh',
      padding: '2rem 0'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div style={{ 
              background: 'white',
              borderRadius: '16px',
              padding: '2.5rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem'
              }}>
                <h2 style={{ 
                  fontWeight: 600,
                  fontSize: '1.6rem',
                  color: '#1e293b',
                  position: 'relative',
                  display: 'inline-block'
                }}>
                  Edit Profile
                  <span style={{ 
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '50px',
                    height: '4px',
                    background: '#2563eb',
                    borderRadius: '2px'
                  }}></span>
                </h2>
                <button 
                  onClick={() => navigate('/user-dashboard?tab=profile')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <i className="fas fa-arrow-left"></i> Back to Profile
                </button>
              </div>

              {error && (
                <div style={{ 
                  background: '#fee2e2',
                  color: '#b91c1c',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div style={{ 
                  background: '#dcfce7',
                  color: '#166534',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <i className="fas fa-check-circle"></i>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" style={{ 
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: '#334155'
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={userData.username}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease'
                    }}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" style={{ 
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: '#334155'
                  }}>
                    Current Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      cursor: 'not-allowed'
                    }}
                    disabled
                  />
                </div>

                {!showEmailChange ? (
                  <button
                    type="button"
                    onClick={() => setShowEmailChange(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      background: 'transparent',
                      color: '#2563eb',
                      border: '1px solid #2563eb',
                      cursor: 'pointer',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <i className="fas fa-envelope"></i> Change Email Address
                  </button>
                ) : (
                  <div style={{ 
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{ 
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      marginBottom: '1rem',
                      color: '#334155'
                    }}>
                      Change Email Address
                    </h4>

                    <div className="mb-3">
                      <label htmlFor="currentPassword" style={{ 
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 500,
                        color: '#334155'
                      }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={userData.currentPassword}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.3s ease'
                        }}
                        required
                        placeholder="Enter your current password"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="newEmail" style={{ 
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 500,
                        color: '#334155'
                      }}>
                        New Email Address
                      </label>
                      <input
                        type="email"
                        id="newEmail"
                        name="newEmail"
                        value={userData.newEmail}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.3s ease'
                        }}
                        required
                        placeholder="Enter your new email address"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailChange(false);
                        setUserData(prev => ({
                          ...prev,
                          currentPassword: '',
                          newEmail: ''
                        }));
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        background: 'transparent',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        marginRight: '10px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="phone" style={{ 
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: '#334155'
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div style={{ 
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '15px',
                  marginTop: '2rem'
                }}>
                  <button
                    type="button"
                    onClick={() => navigate('/user-dashboard?tab=profile')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: 500,
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      color: '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: 500,
                      border: 'none',
                      background: '#2563eb',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;