import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Packages.css";

const apiURL = process.env.REACT_APP_API_URL;

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [paymentState, setPaymentState] = useState({
    formData: {
      amount: "",
      paymentMethod: "",
      number: "",
      pin: "",
    },
    bookingInfo: null,
    isLoading: false,
    showMobileField: false,
    initialized: false,
    errors: {},
  });

  const [paymentType, setPaymentType] = useState("installment"); // 'installment' or 'full'

  const { formData, bookingInfo, isLoading, showMobileField, errors } =
    paymentState;

  useEffect(() => {
    if (!paymentState.initialized && location.state?.bookingData) {
      const bookingData = location.state.bookingData;

      const requiredFields = [
        "id",
        "customer_email",
        "package_name",
        "total_price",
        "user_id",
      ];
      const missingFields = requiredFields.filter(
        (field) => !bookingData[field]
      );

      if (missingFields.length > 0) {
        Swal.fire({
          title: "Error",
          text: `Missing required booking information: ${missingFields.join(
            ", "
          )}`,
          icon: "error",
        }).then(() => navigate("/packages"));
        return;
      }

      const initialPayment = (
        parseFloat(bookingData.total_price) * 0.1
      ).toFixed(2);

      setPaymentState((prev) => ({
        ...prev,
        bookingInfo: bookingData,
        initialized: true,
        formData: {
          ...prev.formData,
          amount: initialPayment,
        },
      }));
    }
  }, [location.state, navigate, paymentState.initialized]);

  useEffect(() => {
    if (bookingInfo) {
      const newAmount =
        paymentType === "full"
          ? bookingInfo.total_price
          : (parseFloat(bookingInfo.total_price) * 0.1).toFixed(2);

      setPaymentState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          amount: newAmount,
        },
      }));
    }
  }, [paymentType, bookingInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === "amount") {
      if (!bookingInfo) return;

      const minAmount =
        paymentType === "full"
          ? bookingInfo.total_price
          : (parseFloat(bookingInfo.total_price) * 0.1).toFixed(2);

      const maxAmount = parseFloat(bookingInfo.total_price).toFixed(2);
      const numericValue = parseFloat(value);

      if (isNaN(numericValue)) {
        newErrors.amount = "Please enter a valid number";
      } else if (numericValue < parseFloat(minAmount)) {
        newErrors.amount = `Amount cannot be less than ৳${minAmount}`;
      } else if (numericValue > parseFloat(maxAmount)) {
        newErrors.amount = `Amount cannot exceed ৳${maxAmount}`;
      } else {
        delete newErrors.amount;
      }

      const formattedValue = isNaN(numericValue)
        ? value
        : numericValue.toFixed(2);

      setPaymentState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          [name]: formattedValue,
        },
        errors: newErrors,
      }));
      return;
    }

    if (name === "number" && !/^01[0-9]{0,9}$/.test(value)) {
      newErrors.number = "Please enter a valid Bangladeshi mobile number";
    } else if (name === "number") {
      delete newErrors.number;
    }

    if (name === "pin" && !/^\d{5}$/.test(value)) {
      newErrors.pin = "PIN must be exactly 5 digits";
    } else if (name === "pin") {
      delete newErrors.pin;
    }

    setPaymentState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value,
      },
      errors: newErrors,
    }));
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        paymentMethod: method,
      },
      showMobileField: true,
      errors: {
        ...prev.errors,
        paymentMethod: null,
      },
    }));
  };

  const handlePaymentTypeSelect = (type) => {
    setPaymentType(type);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    if (!formData.number || !/^01[3-9]\d{8}$/.test(formData.number)) {
      newErrors.number = "Please enter a valid Bangladeshi mobile number";
    }

    if (!formData.pin || !/^\d{5}$/.test(formData.pin)) {
      newErrors.pin = "PIN must be exactly 5 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setPaymentState((prev) => ({ ...prev, errors: newErrors }));
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    if (!bookingInfo.user_id) {
      Swal.fire({
        title: "Error",
        text: "User information missing. Please login again.",
        icon: "error",
      });
      return;
    }

    setPaymentState((prev) => ({ ...prev, isLoading: true }));

    try {
      const paymentData = {
        booking_id: bookingInfo.id.toString(),
        user_id: bookingInfo.user_id,
        customer_email: bookingInfo.customer_email,
        total_price: parseFloat(bookingInfo.total_price).toFixed(2),
        payment_data: {
          amount: parseFloat(formData.amount).toFixed(2),
          paymentMethod: formData.paymentMethod,
          number: formData.number,
          pin: formData.pin,
        },
      };

      const response = await fetch(
        `${apiURL}/backend/server/process_payment.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Payment failed");
      }

      Swal.fire({
        title: "Payment Successful!",
        html: `Your payment of ৳${formData.amount} was processed`,
        icon: "success",
      }).then(() => {
        navigate("/packages");
      });
    } catch (error) {
      let errorMessage = "Payment failed";

      try {
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.message || error.message;
      } catch {
        errorMessage = error.message.includes("Failed to fetch")
          ? "Network error. Please check your connection."
          : error.message;
      }

      Swal.fire({
        title: "Payment Error",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setPaymentState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    await processPayment();
  };

  if (!bookingInfo) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading booking information...</p>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">Complete Your Booking</h3>
              </div>
              <div className="card-body">
                <div className="booking-summary mb-4 p-3 border rounded">
                  <h5>Booking Summary</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Package:</strong> {bookingInfo.package_name}
                      </p>
                      <p>
                        <strong>Start Date:</strong>{" "}
                        {new Date(bookingInfo.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Total Price:</strong> ৳
                        {parseFloat(bookingInfo.total_price).toFixed(2)}
                      </p>
                      <p>
                        <strong>Due After Payment:</strong> ৳
                        {(
                          parseFloat(bookingInfo.total_price) -
                          parseFloat(formData.amount)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Payment Type</label>
                    <div className="d-flex gap-3 mb-3">
                      <button
                        type="button"
                        className={`btn ${
                          paymentType === "installment"
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => handlePaymentTypeSelect("installment")}
                      >
                        Installment (10% Deposit)
                      </button>
                      <button
                        type="button"
                        className={`btn ${
                          paymentType === "full"
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => handlePaymentTypeSelect("full")}
                      >
                        Full Payment
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Amount (BDT)</label>
                    {paymentType === "full" ? (
                      <input
                        type="text"
                        className="form-control"
                        value={formData.amount}
                        readOnly
                      />
                    ) : (
                      <input
                        type="number"
                        className={`form-control ${
                          errors.amount ? "is-invalid" : ""
                        }`}
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        min={(
                          parseFloat(bookingInfo.total_price) * 0.1
                        ).toFixed(2)}
                        max={bookingInfo.total_price}
                        step="0.01"
                        required
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "E") {
                            e.preventDefault();
                          }
                        }}
                      />
                    )}
                    {errors.amount && (
                      <div className="invalid-feedback">{errors.amount}</div>
                    )}
                    <div className="form-text">
                      {paymentType === "full"
                        ? "Full payment required"
                        : `Minimum 10% (৳${(
                            parseFloat(bookingInfo.total_price) * 0.1
                          ).toFixed(2)}) required`}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Select Payment Method</label>
                    <div className="d-flex gap-3 mb-3">
                      {["bkash", "nogod", "rocket"].map((method) => (
                        <button
                          type="button"
                          className={`btn ${
                            formData.paymentMethod === method
                              ? "btn-primary"
                              : "btn-outline-primary"
                          }`}
                          key={method}
                          onClick={() => handlePaymentMethodSelect(method)}
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

                  {showMobileField && (
                    <>
                      <div className="mb-3">
                        <input
                          type="tel"
                          className={`form-control ${
                            errors.number ? "is-invalid" : ""
                          }`}
                          name="number"
                          value={formData.number}
                          onChange={handleInputChange}
                          placeholder={`Enter ${formData.paymentMethod} Number`}
                          onInput={(e) =>
                            (e.target.value = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            ))
                          }
                          pattern="01[3-9]\d{8}"
                          required
                        />
                        {errors.number && (
                          <div className="invalid-feedback">
                            {errors.number}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <input
                          type="password"
                          className={`form-control ${
                            errors.pin ? "is-invalid" : ""
                          }`}
                          name="pin"
                          value={formData.pin}
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
                      className="btn btn-outline-danger"
                      onClick={() => navigate("/packages")}
                      disabled={isLoading}
                    >
                      Cancel Booking
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading || !formData.paymentMethod}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Processing...
                        </>
                      ) : (
                        "Complete Payment"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
