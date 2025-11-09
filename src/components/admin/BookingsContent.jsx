import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faTimes, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Swal from 'sweetalert2';

const apiURL = process.env.REACT_APP_API_URL;

const BookingsContent = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const BASE_IMAGE_URL = `${apiURL}/client/public/assets/img/`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiURL}/backend/server/admin_crud/get_bookings.php`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        
        if (!result?.success || !Array.isArray(result.data)) {
          throw new Error('Invalid API response format');
        }

        // Add memo_url to each booking if memo_number exists
        const bookingsWithMemo = result.data.map(booking => {
          if (booking.memo_number) {
            return {
              ...booking,
              memo_url: `${apiURL}/backend/server/memos/MEMO_${booking.memo_number}.pdf`
            };
          }
          return booking;
        });

        setBookings(bookingsWithMemo);
      } catch (err) {
        setError(err.message);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleCancelBooking = async () => {
    if (!cancellationReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please enter a cancellation reason',
      });
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch(`${apiURL}/backend/server/admin_crud/cancel_booking.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          reason: cancellationReason
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update the local state to reflect the cancellation
        setBookings(bookings.map(booking => 
          booking.id === selectedBooking.id 
            ? { 
                ...booking, 
                status: 'cancelled',
                cancelled_by_admin: true,
                cancellation_reason: cancellationReason
              } 
            : booking
        ));
        setShowCancelModal(false);
        setCancellationReason('');
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Booking cancelled successfully',
          timer: 5000,
          showConfirmButton: false
        });
      } else {
        throw new Error(result.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-success text-white',
      cancelled: 'bg-danger text-white'
    };
    
    return (
      <span className={`badge ${statusClasses[status] || 'bg-secondary'}`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1) || 'Unknown'}
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
        {paymentStatus.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const downloadMemo = async (memoUrl, memoNumber) => {
    try {
      // Try to open in new tab first
      const newTab = window.open(memoUrl, '_blank');
      
      // If popup blocked, download directly
      if (!newTab || newTab.closed) {
        const response = await fetch(memoUrl);
        
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `MEMO_${memoNumber}.pdf`;
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

  if (loading) return <div className="p-4">Loading bookings...</div>;
  if (error) return <div className="p-4 alert alert-danger">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Booking Management</h2>
      
      {/* Booking Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Booking Details #{selectedBooking?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div className="row">
              <div className="col-md-6">
                <h5>Customer Information</h5>
                <p><strong>Name:</strong> {selectedBooking.customer_name || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedBooking.customer_email || 'N/A'}</p>
                {selectedBooking.cancelled_by_admin && (
                  <p className="text-danger">
                    <strong>Cancelled by Admin:</strong> {selectedBooking.cancellation_reason}
                  </p>
                )}
              </div>
              <div className="col-md-6">
                <h5>Booking Information</h5>
                <p><strong>Package:</strong> {selectedBooking.package_name || 'Unknown Package'}</p>
                <p><strong>Destination:</strong> {selectedBooking.destination_name || 'N/A'}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedBooking.status)}</p>
              </div>
              <div className="col-md-6 mt-3">
                <h5>Dates</h5>
                <p><strong>Booking Date:</strong> {selectedBooking.booking_date ? new Date(selectedBooking.booking_date).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Travel Period:</strong> {selectedBooking.start_date ? new Date(selectedBooking.start_date).toLocaleDateString() : 'N/A'} to {selectedBooking.end_date ? new Date(selectedBooking.end_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="col-md-6 mt-3">
                <h5>Payment</h5>
                <p><strong>Total Price:</strong> ৳ {selectedBooking.total_price ? Number(selectedBooking.total_price).toLocaleString() : '0.00'}</p>
                <p><strong>Package Count:</strong> {selectedBooking.package_count || '1'}</p>
                {selectedBooking.memo_number && (
                  <p>
                    <strong>Memo:</strong> MEMO_{selectedBooking.memo_number}
                    <button 
                      onClick={() => downloadMemo(selectedBooking.memo_url, selectedBooking.memo_number)}
                      className="btn btn-sm btn-primary ms-2"
                    >
                      <FontAwesomeIcon icon={faFilePdf} /> Download
                    </button>
                  </p>
                )}
              </div>
              {selectedBooking.special_requests && (
                <div className="col-12 mt-3">
                  <h5>Special Requests</h5>
                  <p>{selectedBooking.special_requests}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>

      {/* Cancellation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Booking #{selectedBooking?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Cancellation Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelBooking}
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bookings Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th className="text-center">Customer</th>
                  <th className="text-center">Package</th>
                  <th className="text-center">Booking Date</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Amount</th>
                  <th className="text-center">Payment</th>
                  <th className="text-center">Deposit</th>
                  <th className="text-center">Due</th>
                  <th className="text-center">Invoice</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.customer_name || 'N/A'}</td>
                      <td className="text-center">{booking.package_name || 'Unknown Package'}</td>
                      <td className="text-center">
                        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="text-center">{getStatusBadge(booking.status)}</td>
                      <td className="text-center">৳ {booking.total_price ? Number(booking.total_price).toLocaleString() : '0.00'}</td>
                      <td className="text-center">{getPaymentBadge(booking.payment_status)}</td>
                      <td className="text-center">
                        <div>
                          ৳{parseFloat(booking.paid_amount || 0).toLocaleString()}                
                        </div>
                      </td>
                      <td className="text-center">
                        {booking.payment_status !== 'fully_paid' && (
                          <div className="text-danger small">
                            ৳{parseFloat(booking.due_amount || 0).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        {booking.memo_number ? (
                          <button 
                            onClick={() => downloadMemo(booking.memo_url, booking.memo_number)}
                            className="btn btn-sm btn-primary"
                            title="Download Memo"
                          >
                            View
                          </button>
                        ) : (
                          <div className="text-center text-muted">N/A</div>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewClick(booking)}
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          {booking.status !== 'cancelled' && (
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleCancelClick(booking)}
                              title="Cancel Booking"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">No bookings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsContent;