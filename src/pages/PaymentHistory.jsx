import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const apiURL = process.env.REACT_APP_API_URL;

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(
          `${apiURL}/backend/server/user_crud/get_payment_history.php`,
          {
            credentials: "include",
          }
        );

        if (response.status === 401) {
          setError("Authentication failed. Please login again.");
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (result.success) {
          setPayments(result.payments);
        } else {
          setError(result.message || "Failed to load payment history");
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Failed to load payment history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    // Check if status is undefined or null
    if (!status) {
      return <span className="badge bg-secondary">Unknown</span>;
    }

    const statusClasses = {
      completed: "bg-success text-white",
      pending: "bg-warning text-dark",
      failed: "bg-danger text-white",
      refunded: "bg-info text-white",
      approved: "bg-success text-white",
      rejected: "bg-danger text-white",
      fully_paid: "bg-success text-white",
      deposit_paid: "bg-warning text-dark",
    };

    // Custom display text for specific statuses
    const statusText = {
      fully_paid: "Paid",
      deposit_paid: "Deposit Paid",
    };

    return (
      <span
        className={`badge ${
          statusClasses[status.toLowerCase()] || "bg-secondary"
        }`}
      >
        {statusText[status.toLowerCase()] ||
          status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStatusComment = (payment) => {
    if (!payment.status) return null;

    const status = payment.status.toLowerCase();

    if (status === "fully_paid") {
      return (
        <div className="text-success small mt-1">
          <i className="fas fa-check-circle me-1"></i>
          Full payment completed
        </div>
      );
    }

    if (status === "deposit_paid") {
      const dueAmount = parseFloat(payment.due_amount || 0);
      return (
        <div className="text-warning small mt-1">
          <i className="fas fa-info-circle me-1"></i>
          {dueAmount > 0
            ? `৳${dueAmount.toLocaleString()} due`
            : "Deposit paid, balance pending"}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "2rem 0",
      }}
    >
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "2.5rem",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "2rem",
                }}
              >
                <h2
                  style={{
                    fontWeight: 600,
                    fontSize: "1.6rem",
                    color: "#1e293b",
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  Payment History
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-8px",
                      left: 0,
                      width: "50px",
                      height: "4px",
                      background: "#2563eb",
                      borderRadius: "2px",
                    }}
                  ></span>
                </h2>
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="btn btn-outline-primary"
                >
                  <i className="fas fa-arrow-left me-2"></i> Back to Bookings
                </button>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              {payments.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
                  <h4>No Payment History</h4>
                  <p className="text-muted">
                    You haven't made any payments yet.
                  </p>
                  <button
                    onClick={() => navigate("/packages")}
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
                        <th>Booking ID</th>
                        <th>Package</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        {/*<th>Receipt</th>*/}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>#{payment.booking_id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              {/*<img 
                                src={payment.package_image || '/images/package-default.jpg'} 
                                alt={payment.package_name} 
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', marginRight: '10px' }}
                                onError={(e) => {
                                  e.target.src = '/images/package-default.jpg';
                                }}
                              />*/}
                              <div>
                                <h6
                                  className="mb-0"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  {payment.package_name}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>{formatDate(payment.payment_date)}</td>
                          <td>
                            <div>
                              ৳
                              {parseFloat(payment.amount || 0).toLocaleString()}
                            </div>
                            {/*{payment.due_amount > 0 && (
                              <div className="text-muted small">
                                Due: ৳{parseFloat(payment.due_amount || 0).toLocaleString()}
                              </div>
                            )}*/}
                          </td>
                          <td>
                            <span className="text-capitalize">
                              {payment.method || "N/A"}
                            </span>
                            {payment.transaction_id && (
                              <div className="text-muted small">
                                Ref: {payment.transaction_id}
                              </div>
                            )}
                          </td>
                          <td>
                            {getStatusBadge(payment.status)}
                            {getStatusComment(payment)}
                          </td>
                          {/*<td>
                            {payment.payment_proof ? (
                              <button 
                                onClick={() => window.open(payment.payment_proof, '_blank')}
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>*/}
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
    </div>
  );
};

export default PaymentHistory;
