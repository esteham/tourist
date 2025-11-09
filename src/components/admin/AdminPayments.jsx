import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Alert,
  Spinner,
  Tab,
  Tabs,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faEnvelope,
  faFilePdf,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

const apiURL = process.env.REACT_APP_API_URL;

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedMemo, setGeneratedMemo] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("Payment Reminder");
  const [activeTab, setActiveTab] = useState("deposit");

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  useEffect(() => {
    console.log("All payments from API:", payments);

    if (payments.length > 0) {
      // Debug each payment's structure
      payments.forEach((payment) => {
        console.log(`Payment ${payment.id}:`, {
          status: payment.payment_status,
          approved: payment.payment_approved,
          approvedType: typeof payment.payment_approved,
          due: payment.due_amount,
          dueType: typeof payment.due_amount,
        });
      });
    }

    console.log("Fully paid payments (filtered):", fullyPaidPayments);
    console.log("Deposit payments (filtered):", depositPaidPayments);
  }, [payments]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/get_payments.php?type=${activeTab}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPayments(Array.isArray(result.data) ? result.data : []);
      } else {
        showAlert(result.message || "Failed to load payments", "danger");
        setPayments([]);
        console.error("API Error:", result);
      }
    } catch (error) {
      showAlert("Network error. Please try again.", "danger");
      setPayments([]);
      console.error("Fetch Error:", error);

      // Additional error details
      if (error instanceof TypeError) {
        console.error("TypeError details:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fullyPaidPayments = payments.filter((p) => {
    return (
      p.payment_status === "fully_paid" && parseInt(p.payment_approved) === 0
    );
  });

  const depositPaidPayments = payments.filter((p) => {
    return (
      (p.payment_status === "deposit_paid" || p.payment_status === "pending") &&
      parseFloat(p.due_amount) > 0
    );
  });

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/approve_payment.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            booking_id: currentPayment.id,
            remarks: remarks,
            admin_id: 1,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showAlert(
          "Payment approved and memo generated successfully!",
          "success"
        );
        setGeneratedMemo({
          memo_number: result.memo_number,
          memo_path: result.memo_path,
        });
        fetchPayments();
        setShowModal(false);
      } else {
        showAlert(result.message || "Approval failed", "danger");
      }
    } catch (error) {
      showAlert("Network error. Please try again.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/reject_payment.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: currentPayment.id,
            remarks: remarks,
            admin_id: 1,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showAlert("Payment rejected!", "success");
        fetchPayments();
        setShowModal(false);
      } else {
        showAlert(result.message || "Rejection failed", "danger");
      }
    } catch (error) {
      showAlert("Network error. Please try again.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const sendPaymentReminder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/send_payment_reminder.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: currentPayment.id,
            subject: emailSubject,
            message: emailContent,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showAlert("Payment reminder sent successfully!", "success");
        setShowEmailModal(false);
        fetchPayments();
      } else {
        showAlert(result.message || "Failed to send reminder", "danger");
      }
    } catch (error) {
      showAlert("Network error. Please try again.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMemo = (memoPath) => {
    window.open(memoPath, "_blank");
  };

  const showAlert = (message, variant) => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: "", variant: "" }), 5000);
  };

  const openModal = (payment) => {
    setCurrentPayment(payment);
    setRemarks("");
    setGeneratedMemo(null);
    setShowModal(true);
  };

  const openEmailModal = (payment) => {
    setCurrentPayment(payment);
    setEmailSubject(`Payment Reminder for Booking #${payment.id}`);
    setEmailContent(
      `Dear ${payment.customer_name},\n\nThis is a reminder that your payment of ৳${payment.due_amount} for booking #${payment.id} is due by ${payment.due_deadline}. Please make the payment at your earliest convenience.\n\nThank you,\nTourist Travel Agency`
    );
    setShowEmailModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "fully_paid":
        return <Badge bg="success">Fully Paid</Badge>;
      case "deposit_paid":
        return <Badge bg="info">Deposit Paid</Badge>;
      case "pending":
        return (
          <Badge bg="warning" text="dark">
            Pending
          </Badge>
        );
      case "cancelled":
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isPaymentDue = (dueDeadline) => {
    if (!dueDeadline) return false;
    const dueDate = new Date(dueDeadline);
    const today = new Date();
    return dueDate < today;
  };

  const renderPaymentTable = (paymentList, showReminder = false) => {
    return (
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th className="text-center">Booking ID</th>
            <th className="text-center">Customer</th>
            <th className="text-center">Package</th>
            <th className="text-center">Amount</th>
            <th className="text-center">Paid</th>
            <th className="text-center">Due</th>
            {showReminder && <th className="text-center">Due Deadline</th>}
            <th className="text-center">Method</th>
            <th className="text-center">Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paymentList.length === 0 ? (
            <tr>
              <td colSpan={showReminder ? 10 : 9} className="text-center">
                No payments found
              </td>
            </tr>
          ) : (
            paymentList.map((payment) => (
              <tr key={payment.id}>
                <td className="text-center">{payment.id}</td>
                <td className="text-center">{payment.customer_name}</td>
                <td className="text-center">{payment.package_name}</td>
                <td className="text-center">
                  ৳ {parseFloat(payment.total_price).toLocaleString()}
                </td>
                <td className="text-center">
                  ৳ {parseFloat(payment.paid_amount).toLocaleString()}
                </td>
                <td className="text-center">
                  ৳ {parseFloat(payment.due_amount).toLocaleString()}
                </td>
                {showReminder && (
                  <td className="text-center">
                    {payment.due_deadline ? (
                      <Badge
                        bg={
                          isPaymentDue(payment.due_deadline)
                            ? "danger"
                            : "warning"
                        }
                      >
                        {formatDate(payment.due_deadline)}
                        {isPaymentDue(payment.due_deadline) && " (Overdue)"}
                      </Badge>
                    ) : (
                      "N/A"
                    )}
                  </td>
                )}
                <td className="text-center">{payment.payment_method}</td>
                <td className="text-center">
                  {getStatusBadge(payment.payment_status)}
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    {/* Show Approve/Reject buttons for fully paid unapproved payments */}
                    {payment.payment_status === "fully_paid" &&
                      parseInt(payment.payment_approved) === 0 && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => openModal(payment)}
                            title="Approve Payment"
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setCurrentPayment(payment);
                              setRemarks("");
                              setShowModal(true);
                            }}
                            title="Reject Payment"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                        </>
                      )}

                    {/* Show Reminder button for deposit payments with due amount */}
                    {showReminder && parseFloat(payment.due_amount) > 0 && (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => openEmailModal(payment)}
                        title="Send Payment Reminder"
                      >
                        <FontAwesomeIcon icon={faEnvelope} /> Send Reminder
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    );
  };

  return (
    <div className="container-fluid">
      <h2 className="my-4">Payment Management</h2>

      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
          dismissible
        >
          {alert.message}
        </Alert>
      )}

      {isLoading && !showModal && !showEmailModal && (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="deposit" title="Deposit Payments">
          {renderPaymentTable(depositPaidPayments, true)}
        </Tab>
        <Tab eventKey="full" title="Fully Paid">
          {renderPaymentTable(fullyPaidPayments)}
        </Tab>
      </Tabs>

      {/* Payment Approval Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Payment Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            currentPayment && (
              <>
                <div className="row">
                  <div className="col-md-6">
                    <h5>Booking Details</h5>
                    <p>
                      <strong>Booking ID:</strong> {currentPayment.id}
                    </p>
                    <p>
                      <strong>Customer:</strong> {currentPayment.customer_name}
                    </p>
                    <p>
                      <strong>Package:</strong> {currentPayment.package_name}
                    </p>
                    <p>
                      <strong>Dates:</strong> {currentPayment.start_date} to{" "}
                      {currentPayment.end_date}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <h5>Payment Information</h5>
                    <p>
                      <strong>Total Amount:</strong> ৳
                      {parseFloat(currentPayment.total_price).toLocaleString()}
                    </p>
                    <p>
                      <strong>Paid Amount:</strong> ৳
                      {parseFloat(currentPayment.paid_amount).toLocaleString()}
                    </p>
                    <p>
                      <strong>Due Amount:</strong> ৳
                      {parseFloat(currentPayment.due_amount).toLocaleString()}
                    </p>
                    {currentPayment.due_deadline && (
                      <p>
                        <strong>Due Deadline:</strong>
                        <Badge
                          bg={
                            isPaymentDue(currentPayment.due_deadline)
                              ? "danger"
                              : "warning"
                          }
                          className="ms-2"
                        >
                          {formatDate(currentPayment.due_deadline)}
                          {isPaymentDue(currentPayment.due_deadline) &&
                            " (Overdue)"}
                        </Badge>
                      </p>
                    )}
                    <p>
                      <strong>Payment Method:</strong>{" "}
                      {currentPayment.payment_method}
                    </p>
                    <p>
                      <strong>Payment Number:</strong> {currentPayment.number}
                    </p>
                    <p>
                      <strong>Transaction ID:</strong>{" "}
                      {currentPayment.transaction_id || "N/A"}
                    </p>
                  </div>

                  <div className="col-12 mt-3">
                    <h5>Payment Proof</h5>
                    {currentPayment.payment_proof ? (
                      <img
                        src={`${apiURL}/uploads/payments/${currentPayment.payment_proof}`}
                        alt="Payment proof"
                        className="img-fluid rounded border"
                        style={{ maxHeight: "300px" }}
                      />
                    ) : (
                      <div className="alert alert-warning">
                        No payment proof uploaded
                      </div>
                    )}
                  </div>
                </div>

                {generatedMemo && (
                  <Alert variant="success" className="mt-3">
                    <p>Memo generated successfully!</p>
                    <p>
                      <strong>Memo Number:</strong> {generatedMemo.memo_number}
                    </p>
                    <Button
                      variant="outline-success"
                      onClick={() => downloadMemo(generatedMemo.memo_path)}
                      className="mt-2"
                    >
                      <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                      Download Memo
                    </Button>
                  </Alert>
                )}
              </>
            )
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={isLoading}
          >
            Close
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={isLoading}>
            {isLoading ? (
              <Spinner
                as="span"
                size="sm"
                animation="border"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <>
                <FontAwesomeIcon icon={faTimes} className="me-2" />
                Reject
              </>
            )}
          </Button>
          <Button
            variant="success"
            onClick={handleApprove}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner
                as="span"
                size="sm"
                animation="border"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                Approve
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Email Reminder Modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)}>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Send Payment Reminder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentPayment && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>To:</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    currentPayment.customer_email || currentPayment.user_email
                  }
                  readOnly
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Subject:</Form.Label>
                <Form.Control
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Message:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
              </Form.Group>

              <div className="alert alert-info">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                Due Deadline:{" "}
                {formatDate(currentPayment.due_deadline) || "Not set"}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEmailModal(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={sendPaymentReminder}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner
                as="span"
                size="sm"
                animation="border"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <>
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                Send Reminder
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPayments;
