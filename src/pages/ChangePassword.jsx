import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const apiURL = process.env.REACT_APP_API_URL;

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate form
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords don't match");
      }

      if (formData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const response = await fetch(
        `${apiURL}/backend/server/change_user_password.php`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Password change failed');
      }

      setSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Get user role from localStorage
      const authData = JSON.parse(localStorage.getItem('auth'));
      const userRole = authData?.user?.role || 'customer';

      // Redirect based on role after 1 second
      setTimeout(() => {
        navigate(userRole === 'admin' 
          ? '/admin-dashboard?tab=profile' 
          : '/user-dashboard?tab=profile'
        );
      }, 1000);

    } catch (error) {
      console.error('Password change error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      fontFamily: "'Poppins', sans-serif", 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      padding: '2rem 0'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div style={{ 
              background: 'white',
              borderRadius: '16px',
              padding: '2.5rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
            }}>
              <h2 style={{ 
                fontWeight: 600,
                fontSize: '1.6rem',
                marginBottom: '2rem',
                color: '#1e293b',
                position: 'relative',
                display: 'inline-block'
              }}>
                Change Password
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
                    value={formData.currentPassword}
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
                  <label htmlFor="newPassword" style={{ 
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: '#334155'
                  }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease'
                    }}
                    required
                    minLength="8"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" style={{ 
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: '#334155'
                  }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s ease'
                    }}
                    required
                    minLength="8"
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
                    onClick={() => {
                      const authData = JSON.parse(localStorage.getItem('auth'));
                      const userRole = authData?.user?.role || 'customer';
                      navigate(userRole === 'admin' 
                        ? '/admin-dashboard?tab=profile' 
                        : '/user-dashboard?tab=profile'
                      );
                    }}
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
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
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

export default ChangePassword;