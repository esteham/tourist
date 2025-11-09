import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';

const apiURL = process.env.REACT_APP_API_URL;

function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    start_date: '',
    end_date: '',
    package_id: '',
    package_count: 1,
    special_requests: '',
    user_id: null
  });
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Calculate minimum booking date (15 days from today)
  const today = new Date();
  const minBookingDate = new Date();
  minBookingDate.setDate(today.getDate() + 15);
  const minBookingDateString = minBookingDate.toISOString().split('T')[0];

  useEffect(() => {
    if (location.state?.packageId) {
      setFormData(prev => ({
        ...prev,
        package_id: location.state.packageId
      }));
    }
    checkAuthStatus();
    fetchPackages();
  }, [location.state]);

  const calculateEndDate = (startDate, duration) => {
    const days = parseInt(duration.match(/\d+/)?.[0]) || 0;
    if (days > 0) {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);
      return endDate.toISOString().split('T')[0];
    }
    return '';
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${apiURL}/backend/server/check_auth.php`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Auth check failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.authenticated && result.user) {
        setIsAuthenticated(true);
        setUser(result.user);
        setFormData(prev => ({
          ...prev,
          user_id: result.user.id,
          customer_name: result.user.username || result.user.name || '',
          customer_email: result.user.email || ''
        }));
      } else {
        setIsAuthenticated(false);
        setUser(null);
        Swal.fire({
          title: 'Login Required',
          text: 'You need to login first to book packages',
          icon: 'warning',
          confirmButtonText: 'Login'
        }).then(() => {
          navigate('/login', { state: { from: '/booking' } });
        });
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${apiURL}/backend/server/admin_crud/get_packages.php`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load packages');
      }
      
      setPackages(result.data.map(pkg => ({
        ...pkg,
        price: parseFloat(pkg.price) || 0,
        is_featured: Boolean(pkg.is_featured),
        hotels: pkg.hotels || [],
        events: pkg.events || []
      })));

      if (location.state?.packageId) {
        const pkg = result.data.find(p => p.id == location.state.packageId);
        if (pkg) {
          setSelectedPackage({
            ...pkg,
            price: parseFloat(pkg.price) || 0
          });
        }
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      if ((name === 'package_id' || name === 'start_date') && 
          newData.package_id && 
          newData.start_date) {
        const selectedPkg = packages.find(p => p.id == newData.package_id);
        if (selectedPkg?.duration) {
          newData.end_date = calculateEndDate(newData.start_date, selectedPkg.duration);
        }
      }
      
      return newData;
    });

    if (name === 'package_id') {
      const pkg = packages.find(p => p.id == value);
      setSelectedPackage(pkg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to continue with booking');
      }

      if (!formData.customer_name.trim()) {
        throw new Error('Please enter your name');
      }
      if (!formData.customer_email.trim()) {
        throw new Error('Please enter your email');
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.customer_email)) {
        throw new Error('Please enter a valid email address');
      }
      if (!formData.package_id) {
        throw new Error('Please select a package');
      }
      if (!formData.start_date) {
        throw new Error('Please select a start date');
      }

      const selectedDate = new Date(formData.start_date);
      const fifteenDaysLater = new Date();
      fifteenDaysLater.setDate(fifteenDaysLater.getDate() + 15);
      
      if (selectedDate < fifteenDaysLater) {
        throw new Error('Start date must be at least 15 days from today');
      }

      const pkg = packages.find(p => p.id == formData.package_id);
      if (!pkg) {
        throw new Error('Selected package not found');
      }

      const bookingResponse = await fetch(`${apiURL}/backend/server/admin_crud/create_booking.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: formData.customer_name.trim(),
          customer_email: formData.customer_email.trim(),
          package_id: formData.package_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          package_count: formData.package_count,
          total_price: (pkg.price * formData.package_count).toFixed(2),
          special_requests: formData.special_requests.trim() || null,
          user_id: user ? user.id : null
        })
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok || !bookingResult.booking_id) {
        throw new Error(bookingResult.message || 'Failed to create booking');
      }

      navigate('/payment', { 
        state: { 
          bookingData: {
            id: bookingResult.booking_id,
            customer_name: formData.customer_name.trim(),
            customer_email: formData.customer_email.trim(),
            package_id: formData.package_id,
            package_name: pkg.name,
            start_date: formData.start_date,
            end_date: formData.end_date,
            package_count: formData.package_count,
            total_price: (pkg.price * formData.package_count).toFixed(2),
            special_requests: formData.special_requests.trim() || null,
            user_id: user ? user.id : null
          },
          depositAmount: (pkg.price * formData.package_count * 0.1).toFixed(2),
          dueAmount: (pkg.price * formData.package_count * 0.9).toFixed(2)
        } 
      });

    } catch (err) {
      Swal.fire({
        title: 'Booking Error',
        text: err.message,
        icon: 'error',
        confirmButtonText: 'OK'
      });
      console.error('Booking submission error:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading booking form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h4>Error loading booking form</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* Hero Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Package Booking
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center">
                  <li className="breadcrumb-item">
                    <a href="/">Home</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="/packages">Packages</a>
                  </li>
                  <li className="breadcrumb-item text-white active" aria-current="page">
                    Booking
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Section */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-primary text-white">
                  <h3 className="mb-0 text-center py-2">Booking Details</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control"
                            id="customer_name"
                            name="customer_name"
                            placeholder="Your Name"
                            value={formData.customer_name}
                            onChange={handleInputChange}
                            required
                          />
                          <label htmlFor="customer_name">Your Name</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="email"
                            className="form-control"
                            id="customer_email"
                            name="customer_email"
                            placeholder="Your Email"
                            value={formData.customer_email}
                            onChange={handleInputChange}
                            required
                          />
                          <label htmlFor="customer_email">Your Email</label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="date"
                            className="form-control"
                            id="start_date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleInputChange}
                            min={minBookingDateString}
                            required
                          />
                          <label htmlFor="start_date">Start Date</label>
                          <small className="text-muted d-block mt-1">Bookings must be made at least 15 days in advance</small>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="date"
                            className="form-control"
                            id="end_date"
                            name="end_date"
                            value={formData.end_date}
                            readOnly
                          />
                          <label htmlFor="end_date">End Date</label>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <select
                            className="form-select"
                            id="package_id"
                            name="package_id"
                            value={formData.package_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Package</option>
                            {packages.map((pkg) => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} (৳ {Number(pkg.price).toFixed(2)})
                              </option>
                            ))}
                          </select>
                          <label htmlFor="package_id">Package</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-floating mb-3">
                          <input
                            type="number"
                            className="form-control"
                            id="package_count"
                            name="package_count"
                            min="1"
                            value={formData.package_count}
                            onChange={handleInputChange}
                            required
                          />
                          <label htmlFor="package_count">Number of Packages</label>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="form-floating mb-3">
                          <textarea
                            className="form-control"
                            placeholder="Special Request"
                            id="special_requests"
                            name="special_requests"
                            style={{ height: 100 }}
                            value={formData.special_requests}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="special_requests">Special Request</label>
                        </div>
                      </div>
                      <div className="col-12">
                        <button
                          className="btn btn-primary w-100 py-3"
                          type="submit"
                        >
                          Proceed to Payment
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-primary text-white">
                  <h3 className="mb-0 py-2 text-center">Package Summary</h3>
                </div>
                <div className="card-body">
                  {selectedPackage ? (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">{selectedPackage.name}</h3>
                        <h4 className="mb-0 text-primary">৳ {Number(selectedPackage.price).toFixed(2)}</h4>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="d-flex align-items-center">
                          <i className="fa fa-info-circle text-primary me-2"></i>
                          Package Details
                        </h5>
                        <p className="mb-2"><strong>Destination:</strong> {selectedPackage.destination_name || 'N/A'}</p>
                        <p className="mb-2"><strong>Duration:</strong> {selectedPackage.duration || 'N/A'}</p>
                        {selectedPackage.description && (
                          <p className="mb-3">{selectedPackage.description}</p>
                        )}
                      </div>

                      <div className="mb-4">
                        <h5 className="d-flex align-items-center">
                          <i className="fa fa-check-circle text-primary me-2"></i>
                          What's Included
                        </h5>
                        <ul className="list-unstyled">
                          {selectedPackage.inclusions ? (
                            selectedPackage.inclusions.split(',').map((item, i) => (
                              <li key={i} className="mb-1">
                                <i className="fa fa-check text-success me-2"></i>
                                {item.trim()}
                              </li>
                            ))
                          ) : (
                            <li className="text-muted">No inclusions specified</li>
                          )}
                        </ul>
                      </div>

                      <div className="border-top pt-3">
                        <h5 className="d-flex align-items-center">
                          <i className="fa fa-calendar-alt text-primary me-2"></i>
                          Booking Summary
                        </h5>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Package Price:</span>
                          <span>৳ {Number(selectedPackage.price).toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Quantity:</span>
                          <span>{formData.package_count}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Duration:</span>
                          <span>
                            {formData.start_date ? 
                              `${formData.start_date} to ${formData.end_date}` : 
                              'Select dates'
                            }
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mt-3 pt-2 border-top">
                          <h5 className="mb-0">Total:</h5>
                          <h5 className="mb-0 text-primary">
                            ৳ {(selectedPackage.price * formData.package_count).toFixed(2)}
                          </h5>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <i className="fa fa-box-open fa-3x text-muted mb-3"></i>
                      <h5>No package selected</h5>
                      <p>Please select a package from the dropdown to see details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;