import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faSpinner, 
  faExclamationTriangle,
  faBuilding,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faGlobe,
  faEdit
} from '@fortawesome/free-solid-svg-icons';

const apiURL = process.env.REACT_APP_API_URL;

const AdminAbout = () => {
  const [aboutData, setAboutData] = useState({
    company_name: '',
    address: '',
    phone: '',
    email: '',
    map_url: '',
    about_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Check if user is authenticated (similar to your AdminContact component)
  const isAuthenticated = () => {
    const authData = localStorage.getItem('auth');
    if (!authData) return false;
    
    try {
      const parsedData = JSON.parse(authData);
      return parsedData.isAuthenticated && parsedData.user.role === 'admin';
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchAboutData();
    } else {
      setError('Authentication required. Please login again.');
      setLoading(false);
    }
  }, []);

  const fetchAboutData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch(`${apiURL}/backend/server/about.php`, {
      credentials: 'include'
    });
    
    if (response.status === 401) {
      setError('Authentication failed. Please login again.');
      localStorage.removeItem('auth');
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    if (result.success) {
      setAboutData(result.data); // <-- FIX HERE
    } else {
      setError(result.message || 'Failed to load about info');
    }
  } catch (err) {
    console.error('Error fetching about data:', err);
    setError('Failed to load about information. Please try again later.');
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAboutData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch(`${apiURL}/backend/server/admin_crud/update_about.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aboutData),
        credentials: 'include'
      });

      if (response.status === 401) {
        setError('Authentication failed. Please login again.');
        localStorage.removeItem('authData');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to save about information');
      }

      const result = await response.json();
      setSuccess('About information updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving about data:', err);
      setError('Failed to save about information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchAboutData(); // Reload original data
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleLoginRedirect = () => {
    window.location.href = '/admin-login';
  };

  if (!isAuthenticated()) {
    return (
      <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="text-warning mb-3" />
          <h4>Authentication Required</h4>
          <p className="text-muted mb-4">Please login to access about page management</p>
          <button className="btn btn-primary" onClick={handleLoginRedirect}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
          <p>Loading about information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">About Page Management</h2>
        <div>
          {!isEditing ? (
            <button 
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <FontAwesomeIcon icon={faEdit} className="me-2" />
              Edit Information
            </button>
          ) : (
            <div>
              <button 
                className="btn btn-success me-2"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <div>{error}</div>
          <button className="btn btn-sm btn-outline-danger ms-auto" onClick={fetchAboutData}>
            Retry
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success d-flex align-items-center" role="alert">
          <div>{success}</div>
          <button 
            type="button" 
            className="btn-close ms-auto" 
            onClick={() => setSuccess(null)} 
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="m-0">Company Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="company_name" className="form-label">
                  <FontAwesomeIcon icon={faBuilding} className="me-2" />
                  Company Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company_name"
                  name="company_name"
                  value={aboutData.company_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  Address
                </label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  rows="3"
                  value={aboutData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      <FontAwesomeIcon icon={faPhone} className="me-2" />
                      Phone
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={aboutData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={aboutData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="map_url" className="form-label">
                  <FontAwesomeIcon icon={faGlobe} className="me-2" />
                  Google Maps Embed URL
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="map_url"
                  name="map_url"
                  value={aboutData.map_url}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <div className="form-text">
                  Paste the embed URL from Google Maps
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="m-0">About Text</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="about_text" className="form-label">
                  Company Description
                </label>
                <textarea
                  className="form-control"
                  id="about_text"
                  name="about_text"
                  rows="10"
                  value={aboutData.about_text}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                ></textarea>
                <div className="form-text">
                  This text will appear on the about page of your website
                </div>
              </div>
            </div>
          </div>

          {!isEditing && aboutData.map_url && (
            <div className="card">
              <div className="card-header bg-light">
                <h5 className="m-0">Map Preview</h5>
              </div>
              <div className="card-body">
                <div className="ratio ratio-16x9">
                  <iframe
                    src={aboutData.map_url}
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;