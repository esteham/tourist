import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const apiURL = process.env.REACT_APP_API_URL;

const CompletePayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "",
    number: "",
    pin: "",
  });
  const [errors, setErrors] = useState({});
  const [paymentDueDatePassed, setPaymentDueDatePassed] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(
          `${apiURL}/backend/server/get_booking.php?id=${bookingId}`
        );
        const data = await response.json();

        if (data.success) {
          setBooking(data.booking);
          setPaymentData((prev) => ({
            ...prev,
            amount: data.booking.due_amount,
          }));

          // Check if payment due date has passed
          if (data.booking.due_deadline) {
            const dueDate = new Date(data.booking.due_deadline);
            const now = new Date();
            setPaymentDueDatePassed(dueDate < now);
          }
        } else {
          throw new Error(data.message || "Failed to load booking");
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
        navigate("/my-bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentData.paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (
      parseFloat(paymentData.amount) > parseFloat(booking.due_amount)
    ) {
      newErrors.amount = `Amount cannot exceed remaining balance of ৳${booking.due_amount}`;
    }

    if (!paymentData.number || !/^01[3-9]\d{8}$/.test(paymentData.number)) {
      newErrors.number = "Please enter a valid Bangladeshi mobile number";
    }

    if (!paymentData.pin || !/^\d{5}$/.test(paymentData.pin)) {
      newErrors.pin = "PIN must be exactly 5 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (paymentDueDatePassed) {
      Swal.fire(
        "Error",
        "The payment due date has passed. Please contact customer support.",
        "error"
      );
      return;
    }

    try {
      const response = await fetch(
        `${apiURL}/backend/server/process_payment.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: bookingId,
            user_id: booking.user_id,
            customer_email: booking.customer_email,
            total_price: booking.total_price,
            payment_data: {
              amount: paymentData.amount,
              paymentMethod: paymentData.paymentMethod,
              number: paymentData.number,
              pin: paymentData.pin,
            },
          }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: "Payment Successful!",
          text: `Your payment of ৳${paymentData.amount} was processed`,
          icon: "success",
        }).then(() => {
          navigate("/my-bookings");
        });
      } else {
        throw new Error(data.message || "Payment failed");
      }
    } catch (error) {
      Swal.fire("Payment Error", error.message, "error");
    }
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                Complete Payment for Booking #{bookingId}
              </h3>
            </div>
            <div className="card-body">
              {paymentDueDatePassed && (
                <div className="alert alert-danger">
                  <strong>Notice:</strong> The payment due date has passed.
                  Please contact customer support to proceed.
                </div>
              )}

              <div className="mb-4">
                <h5>Payment Summary</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Package:</strong> {booking.package_name}
                    </p>
                    <p>
                      <strong>Total Price:</strong> ৳
                      {parseFloat(booking.total_price).toFixed(2)}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Already Paid:</strong> ৳
                      {parseFloat(booking.paid_amount).toFixed(2)}
                    </p>
                    <p>
                      <strong>Remaining Balance:</strong> ৳
                      {parseFloat(booking.due_amount).toFixed(2)}
                    </p>
                    {booking.due_deadline && (
                      <p>
                        <strong>Payment Due Date:</strong>{" "}
                        {new Date(booking.due_deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Amount to Pay (BDT)</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.amount ? "is-invalid" : ""
                    }`}
                    name="amount"
                    value={paymentData.amount}
                    onChange={handleInputChange}
                    min="0.01"
                    max={booking.due_amount}
                    step="0.01"
                    required
                    disabled={paymentDueDatePassed}
                  />
                  {errors.amount && (
                    <div className="invalid-feedback">{errors.amount}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Select Payment Method</label>
                  <div className="d-flex gap-3 mb-3">
                    {["bkash", "nogod", "rocket"].map((method) => (
                      <button
                        type="button"
                        className={`btn ${
                          paymentData.paymentMethod === method
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        key={method}
                        onClick={() =>
                          setPaymentData((prev) => ({
                            ...prev,
                            paymentMethod: method,
                          }))
                        }
                        disabled={paymentDueDatePassed}
                      >
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </button>
                    ))}
                  </div>
                  {errors.paymentMethod && (
                    <div className="text-danger small">
                      {errors.paymentMethod}
                    </div>
                  )}
                </div>

                {paymentData.paymentMethod && (
                  <>
                    <div className="mb-3">
                      <input
                        type="tel"
                        className={`form-control ${
                          errors.number ? "is-invalid" : ""
                        }`}
                        name="number"
                        value={paymentData.number}
                        onChange={handleInputChange}
                        placeholder={`Enter ${paymentData.paymentMethod} Number`}
                        onInput={(e) =>
                          (e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          ))
                        }
                        pattern="01[3-9]\d{8}"
                        required
                        disabled={paymentDueDatePassed}
                      />
                      {errors.number && (
                        <div className="invalid-feedback">{errors.number}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <input
                        type="password"
                        className={`form-control ${
                          errors.pin ? "is-invalid" : ""
                        }`}
                        name="pin"
                        value={paymentData.pin}
                        onChange={handleInputChange}
                        onInput={(e) =>
                          (e.target.value = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          ))
                        }
                        placeholder="Enter PIN"
                        maxLength="5"
                        required
                        disabled={paymentDueDatePassed}
                      />
                      {errors.pin && (
                        <div className="invalid-feedback">{errors.pin}</div>
                      )}
                    </div>
                  </>
                )}

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/my-bookings")}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      !paymentData.paymentMethod || paymentDueDatePassed
                    }
                  >
                    Complete Payment
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

export default CompletePayment;
