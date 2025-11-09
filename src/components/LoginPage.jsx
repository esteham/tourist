import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const apiURL = process.env.REACT_APP_API_URL;

function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState({ message: '', field: '' });
  const navigate = useNavigate();

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setAuthError({ message: '', field: '' });

  if (!loginEmail || !loginPassword) {
    setAuthError({ 
      message: 'Please fill in all fields',
      field: !loginEmail ? 'email' : 'password'
    });
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch(`${apiURL}/backend/server/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginEmail,
        password: loginPassword
      }),
      credentials: 'include'
    });

    const result = await response.json();

    if (result.success) {
      // 1. Clear any existing auth data first
      localStorage.removeItem('auth');
      
      // 2. Update localStorage with new auth data
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: result.user
      }));
      
      // 3. Force a hard redirect to ensure complete state refresh
      window.location.href = result.user.role === 'admin' 
        ? '/admin-dashboard' 
        : '/';
    } else {
      const errorMsg = result.message.toLowerCase();
      const errorField = errorMsg.includes('email') ? 'email' : 
                       errorMsg.includes('password') ? 'password' : '';
      
      setAuthError({
        message: errorField ? `Invalid ${errorField}` : 'Invalid email or password',
        field: errorField
      });
    }
  } catch (err) {
    console.error(err);
    setAuthError({ 
      message: 'Login failed. Please try again later.',
      field: ''
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError({ message: '', field: '' });

    if (registerPassword !== registerConfirm) {
      setAuthError({ 
        message: 'Passwords do not match',
        field: 'confirm'
      });
      setIsLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setAuthError({ 
        message: 'Password must be at least 6 characters',
        field: 'password'
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiURL}/backend/server/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setAuthError({ 
          message: 'Registration successful! Please login.',
          field: ''
        });
        setActiveTab('login');
        // Clear registration fields
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegisterConfirm('');
      } else {
        setAuthError({ 
          message: result.message || 'Registration failed',
          field: ''
        });
      }
    } catch (err) {
      console.error(err);
      setAuthError({ 
        message: 'Registration failed. Please try again later.',
        field: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFields = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirm('');
    setAuthError({ message: '', field: '' });
  };

  const switchToLogin = () => {
    resetFields();
    setActiveTab('login');
  };

  const switchToRegister = () => {
    resetFields();
    setActiveTab('register');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      backgroundColor: '#e6e7ee'
    }}>
      <div className="container" style={{ maxWidth: '400px' }}>
        <div className="p-4" style={{
          borderRadius: '20px',
          boxShadow: '10px 10px 20px #babecc, -10px -10px 20px #ffffff',
          backgroundColor: '#e6e7ee'
        }}>
          {/* Tabs */}
          {/*<div className="d-flex mb-4">
            <button
              className={`flex-grow-1 py-3 border-0 ${activeTab === 'login' ? 'active-tab' : 'inactive-tab'}`}
              onClick={switchToLogin}
              style={{
                borderRadius: '12px 0 0 12px',
                fontWeight: '500'
              }}
            >
              Login
            </button>
            <button
              className={`flex-grow-1 py-3 border-0 ${activeTab === 'register' ? 'active-tab' : 'inactive-tab'}`}
              onClick={switchToRegister}
              style={{
                borderRadius: '0 12px 12px 0',
                fontWeight: '500'
              }}
            >
              Register
            </button>
          </div>*/}

          {/* Error message - Professional styling */}
          {authError.message && (
            <div className="mb-3 text-center" style={{
              color: '#dc3545',
              fontSize: '0.9rem',
              fontWeight: '500',
              animation: 'fadeIn 0.3s ease-in-out'
            }}>
              {authError.message}
            </div>
          )}

          {/* Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (authError.field === 'email') {
                      setAuthError({ message: '', field: '' });
                    }
                  }}
                  required
                  style={{
                    borderRadius: '12px',
                    boxShadow: 'inset 5px 5px 10px #babecc, inset -5px -5px 10px #ffffff',
                    border: authError.field === 'email' ? '1px solid #dc3545' : 'none',
                    backgroundColor: '#e6e7ee',
                    padding: '12px 16px',
                    transition: 'border 0.2s ease'
                  }}
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (authError.field === 'password') {
                      setAuthError({ message: '', field: '' });
                    }
                  }}
                  required
                  style={{
                    borderRadius: '12px',
                    boxShadow: 'inset 5px 5px 10px #babecc, inset -5px -5px 10px #ffffff',
                    border: authError.field === 'password' ? '1px solid #dc3545' : 'none',
                    backgroundColor: '#e6e7ee',
                    padding: '12px 16px',
                    transition: 'border 0.2s ease'
                  }}
                />
              </div>
              <button 
                type="submit" 
                className="w-100 py-3 mt-3"
                disabled={isLoading}
                style={{
                  borderRadius: '12px',
                  boxShadow: '5px 5px 10px #babecc, -5px -5px 10px #ffffff',
                  border: 'none',
                  backgroundColor: '#e6e7ee',
                  color: '#31344b',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : 'Login'}
              </button>
              <div className="text-center mt-3">
                <button 
                  type="button" 
                  className="btn btn-link p-0"
                  onClick={switchToRegister}
                  style={{
                    color: '#31344b',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  Don't have an account? <span style={{ fontWeight: '500' }}>Register</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  style={{
                    borderRadius: '12px',
                    boxShadow: 'inset 5px 5px 10px #babecc, inset -5px -5px 10px #ffffff',
                    border: 'none',
                    backgroundColor: '#e6e7ee',
                    padding: '12px 16px'
                  }}
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  style={{
                    borderRadius: '12px',
                    boxShadow: 'inset 5px 5px 10px #babecc, inset -5px -5px 10px #ffffff',
                    border: 'none',
                    backgroundColor: '#e6e7ee',
                    padding: '12px 16px'
                  }}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password (min 6 characters)"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  minLength="6"
                  required
                  style={{
                    borderRadius: '12px',
                    boxShadow: 'inset 5px 5px 10px #babecc, inset -5px -5px 10px #ffffff',
                    border: authError.field === 'password' ? '1px solid #dc3545' : 'none',
                    backgroundColor: '#e6e7ee',
                    padding: '12px 16px',
                    transition: 'border 0.2s ease'
                  }}
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm password"
                  value={registerConfirm}
                  onChange={(e) => setRegisterConfirm(e.target.value)}
                  required
                  style={{
                    borderRadius: '12px',
                    boxShadow: 'inset 5px 5px 10px #babecc, inset -5px -5px 10px #ffffff',
                    border: authError.field === 'confirm' ? '1px solid #dc3545' : 'none',
                    backgroundColor: '#e6e7ee',
                    padding: '12px 16px',
                    transition: 'border 0.2s ease'
                  }}
                />
              </div>
              <button 
                type="submit" 
                className="w-100 py-3"
                disabled={isLoading}
                style={{
                  borderRadius: '12px',
                  boxShadow: '5px 5px 10px #babecc, -5px -5px 10px #ffffff',
                  border: 'none',
                  backgroundColor: '#e6e7ee',
                  color: '#31344b',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : 'Register'}
              </button>
              <div className="text-center mt-3">
                <button 
                  type="button" 
                  className="btn btn-link p-0"
                  onClick={switchToLogin}
                  style={{
                    color: '#31344b',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  Already have an account? <span style={{ fontWeight: '500' }}>Login</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .active-tab {
          background: #e6e7ee;
          box-shadow: 5px 5px 10px #babecc, -5px -5px 10px #ffffff;
          color: #31344b;
        }
        .inactive-tab {
          background: #e6e7ee;
          box-shadow: inset 5px 5px 10px #babecc, inset -5px -5px 10px #ffffff;
          color: #777;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;