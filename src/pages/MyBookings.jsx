import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Modal from 'react-bootstrap/Modal';

const apiURL = process.env.REACT_APP_API_URL;

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();
  const BASE_IMAGE_URL = `${apiURL}/client/public/assets/img/`;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${apiURL}/backend/server/user_crud/get_user_bookings.php`, {
          credentials: 'include'
        });
        const result = await response.json();

        if (result.success) {
          setBookings(result.bookings);
        } else {
          setError(result.message || 'Failed to load bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-success text-white',
      cancelled: 'bg-danger text-white'
    };
    return (
      <span className={`badge ${statusClasses[status] || 'bg-secondary'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'N/A'}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus) => {
    const paymentClasses = {
      pending: 'bg-warning text-dark',
      deposit_paid: 'bg-info text-white',
      fully_paid: 'bg-success text-white',
      cancelled: 'bg-danger text-white'
    };
    return (
      <span className={`badge ${paymentClasses[paymentStatus] || 'bg-secondary'}`}>
        {paymentStatus ? paymentStatus.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'N/A'}
      </span>
    );
  };

  const downloadMemo = async (memoUrl, memoNumber) => {
    try {
      // Try to open in new tab first
      const newTab = window.open(memoUrl, '_blank');
      
      // If popup blocked, download directly
      if (!newTab || newTab.closed) {
        const response = await fetch(memoUrl, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${memoNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download memo. Please try again.');
    }
  };

  const handleCancelBooking = (booking) => {
    Swal.fire({
      title: 'Cancel Booking',
      html: `Are you sure you want to cancel your booking for <strong>${booking.package_name}</strong>?<br><br>
            <span class="text-danger">Note: To process your booking cancellation and deposit refund, please contact our admin team.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel Booking',
      cancelButtonText: 'No, Keep Booking',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Contact Admin Required',
          html: `Please contact our admin team to process your cancellation and refund:<br><br>
                <strong>Email:</strong> admin@gmail.com<br>
                <strong>Phone:</strong> +88019XXXXXXXX<br><br>
                Reference: Booking #${booking.id} - ${booking.package_name}`,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }
    });
  };

  const handleShowModal = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
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
      minHeight: '100vh',
      padding: '2rem 0'
    }}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-12">
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
                  My Bookings
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
                  onClick={() => navigate('/packages')}
                  className="btn btn-primary"
                >
                  <i className="fas fa-plus me-2"></i> Book New Package
                </button>
              </div>

              {error && (
                <div className="alert alert-danger text-center">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              {bookings.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                  <h4>No Bookings Found</h4>
                  <p className="text-muted">You haven't made any bookings yet.</p>
                  <button 
                    onClick={() => navigate('/packages')}
                    className="btn btn-primary mt-3"
                  >
                    Browse Packages
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th className="text-center">ID</th>
                        <th className="text-center">Package</th>
                        <th className="text-center">Dates</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Payment</th>
                        <th className="text-center">Amount</th>
                        <th className="text-center">Paid</th>
                        <th className="text-center">Due</th>
                        <th className="text-center">Memo</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => (
                        <tr key={booking.id}>
                          <td className="text-center align-middle">#{booking.id}</td>
                          <td className="">
                            <div className="d-flex align-items-center justify-content-center">
                              <img 
                                src={`${BASE_IMAGE_URL}${booking.image_url || 'package-default.jpg'}`} 
                                alt={booking.package_name} 
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.src = `${BASE_IMAGE_URL}package-default.jpg`;
                                }}
                              />
                              <div className="ms-2">
                                <h6 className="mb-0">{booking.package_name}</h6>
                                <small className="text-muted">Booked: {formatDate(booking.booking_date)}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center align-middle">
                            <div>
                              <div>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</div>
                              {/*<small className="text-muted">{booking.duration || 'N/A'}</small>*/}
                            </div>
                          </td>
                          <td className="text-center align-middle">{getStatusBadge(booking.status)}</td>
                          <td className="text-center align-middle">{getPaymentBadge(booking.payment_status)}</td>
                          <td className="text-center align-middle">৳{parseFloat(booking.total_price || 0).toLocaleString()}</td>
                          <td className="text-center align-middle">৳{parseFloat(booking.paid_amount || 0).toLocaleString()}</td>
                          <td className="text-center align-middle">
                            {booking.payment_status !== 'fully_paid' && parseFloat(booking.due_amount || 0) > 0 ? (
                              <span className="text-danger">
                                ৳{parseFloat(booking.due_amount || 0).toLocaleString()}
                                <button 
                                  onClick={() => navigate(`/complete-payment/${booking.id}`)}
                                  className="btn btn-sm btn-success mx-2 px-3"
                                >
                                  Pay
                                </button>
                              </span>
                            ) : (
                              <span className="text-success">Paid</span>
                            )}
                          </td>
                          <td className="text-center align-middle">
                            {booking.status === 'confirmed' && booking.memo_url ? (
                              <button 
                                onClick={() => downloadMemo(booking.memo_url, booking.memo_number)}
                                className="btn btn-sm btn-primary"
                                title="Download Payment Memo"
                              >
                                <i className="fas fa-download me-1"></i> Download
                              </button>
                            ) : (
                              <span className="badge bg-secondary">Not Available</span>
                            )}
                          </td>
                          <td className="text-center align-middle">
                            <div className="d-flex justify-content-center gap-2">
                              <button 
                                onClick={() => handleShowModal(booking)}
                                className="btn btn-sm btn-outline-primary"
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              {(booking.status === 'pending' || booking.payment_status === 'deposit_paid') && (
                                <button 
                                  onClick={() => handleCancelBooking(booking)}
                                  className="btn btn-sm btn-outline-danger"
                                  title="Cancel Booking"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <h6 className="text-primary">Package Information</h6>
                <div className="text-center mb-3">
                  <img 
                    src={`${BASE_IMAGE_URL}${selectedBooking.image_url || 'package-default.jpg'}`} 
                    alt={selectedBooking.package_name} 
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                    onError={(e) => {
                      e.target.src = `${BASE_IMAGE_URL}package-default.jpg`;
                    }}
                  />
                </div>
                <p><strong>Package:</strong> {selectedBooking.package_name}</p>
                {/*<p><strong>Duration:</strong> {selectedBooking.duration || 'N/A'}</p>*/}
                <p><strong>Travel Dates:</strong> {formatDate(selectedBooking.start_date)} - {formatDate(selectedBooking.end_date)}</p>
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-primary">Booking Information</h6>
                <p><strong>Booking ID:</strong> #{selectedBooking.id}</p>
                <p><strong>Booking Date:</strong> {formatDateTime(selectedBooking.booking_date)}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedBooking.status)}</p>
                <p><strong>Payment Status:</strong> {getPaymentBadge(selectedBooking.payment_status)}</p>
                {selectedBooking.due_deadline && (
                  <p><strong>Due Deadline:</strong> {formatDateTime(selectedBooking.due_deadline)}</p>
                )}
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-primary">Payment Details</h6>
                <p><strong>Total Price:</strong> ৳{parseFloat(selectedBooking.total_price || 0).toLocaleString()}</p>
                <p><strong>Paid Amount:</strong> ৳{parseFloat(selectedBooking.paid_amount || 0).toLocaleString()}</p>
                <p className="text-danger"><strong>Due Amount:</strong> ৳{parseFloat(selectedBooking.due_amount || 0).toLocaleString()}</p>
                {selectedBooking.deposit_date && (
                  <p><strong>Deposit Paid:</strong> {formatDateTime(selectedBooking.deposit_date)}</p>
                )}
                {selectedBooking.full_payment_date && (
                  <p><strong>Full Payment:</strong> {formatDateTime(selectedBooking.full_payment_date)}</p>
                )}
                {selectedBooking.payment_method && (
                  <p><strong>Payment Method:</strong> {selectedBooking.payment_method}</p>
                )}
              </div>
              
              <div className="col-md-6 mb-3">
                <h6 className="text-primary">Customer Information</h6>
                <p><strong>Name:</strong> {selectedBooking.customer_name}</p>
                <p><strong>Email:</strong> {selectedBooking.customer_email}</p>
                {selectedBooking.number && (
                  <p><strong>Phone:</strong> {selectedBooking.number}</p>
                )}
                {selectedBooking.special_requests && (
                  <p><strong>Special Requests:</strong> {selectedBooking.special_requests}</p>
                )}
              </div>
              
              {selectedBooking.remarks && (
                <div className="col-12 mb-3">
                  <h6 className="text-primary">Remarks</h6>
                  <p>{selectedBooking.remarks}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Close
          </button>
          {selectedBooking && selectedBooking.payment_status === 'deposit_paid' && (
            <button 
              onClick={() => navigate(`/complete-payment/${selectedBooking.id}`)}
              className="btn btn-primary"
            >
              Pay Due Amount
            </button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyBookings;