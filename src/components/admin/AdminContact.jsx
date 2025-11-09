import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faReply,
  faTrash,
  faSearch,
  faFilter,
  faSpinner,
  faExclamationTriangle,
  faSignInAlt,
} from "@fortawesome/free-solid-svg-icons";

const apiURL = process.env.REACT_APP_API_URL;

const AdminContact = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is authenticated
  const isAuthenticated = () => {
    const authData = localStorage.getItem("auth");
    if (!authData) return false;

    try {
      const parsedData = JSON.parse(authData);
      return parsedData.isAuthenticated && parsedData.user.role === "admin";
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchSubmissions();
    } else {
      setError("Authentication required. Please login again.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, filter, searchTerm]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/contact-submissions.php`,
        {
          credentials: "include",
        }
      );

      if (response.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("authData");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching contact submissions:", err);
      setError("Failed to load contact submissions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let result = [...submissions];

    // Filter by status
    if (filter !== "all") {
      if (filter === "read") {
        result = result.filter((item) => item.is_read);
      } else if (filter === "unread") {
        result = result.filter((item) => !item.is_read);
      } else if (filter === "responded") {
        result = result.filter((item) => item.responded);
      } else if (filter === "not_responded") {
        result = result.filter((item) => !item.responded);
      }
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.email.toLowerCase().includes(term) ||
          item.subject.toLowerCase().includes(term) ||
          (item.message && item.message.toLowerCase().includes(term))
      );
    }

    setFilteredSubmissions(result);
  };

  const markAsRead = async (id, currentReadStatus) => {
    try {
      // Toggle read status: 0 -> 1, 1 -> 0
      const newReadStatus = currentReadStatus === 1 ? 0 : 1;

      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/contact-submissions.php?id=${id}&action=read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_read: newReadStatus }),
          credentials: "include",
        }
      );

      if (response.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("authData");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update read status");
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: newReadStatus } : item
        )
      );
    } catch (err) {
      console.error("Error updating read status:", err);
      setError("Failed to update read status. Please try again.");
    }
  };

  const sendResponse = async (id) => {
    if (!responseText.trim()) {
      alert("Please enter a response message");
      return;
    }

    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/contact-submissions.php?id=${id}&action=respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ response: responseText }),
          credentials: "include",
        }
      );

      if (response.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("authData");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to send response");
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, responded: 1, response: responseText }
            : item
        )
      );

      setResponseText("");
      setSelectedSubmission(null);
      alert("Response sent successfully!");
    } catch (err) {
      console.error("Error sending response:", err);
      setError("Failed to send response. Please try again.");
    }
  };

  const deleteSubmission = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/contact-submissions.php?id=${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("authData");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete submission");
      }

      // Update local state
      setSubmissions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting submission:", err);
      setError("Failed to delete submission. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleLoginRedirect = () => {
    window.location.href = "/admin-login";
  };

  if (!isAuthenticated()) {
    return (
      <div
        className="container-fluid p-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSignInAlt}
            size="3x"
            className="text-warning mb-3"
          />
          <h4>Authentication Required</h4>
          <p className="text-muted mb-4">
            Please login to access contact submissions
          </p>
          <button className="btn btn-primary" onClick={handleLoginRedirect}>
            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="container-fluid p-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="3x"
            className="text-primary mb-3"
          />
          <p>Loading contact submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert"
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <div>{error}</div>
          <button
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={fetchSubmissions}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Contact Submissions</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={fetchSubmissions}
        >
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h6 className="m-0">Filters</h6>
          <FontAwesomeIcon icon={faFilter} />
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label htmlFor="filter" className="form-label">
                Filter by Status
              </label>
              <select
                className="form-select"
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Submissions</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="not_responded">Not Responded</option>
                <option value="responded">Responded</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="search" className="form-label">
                Search
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="search"
                  placeholder="Search by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="card">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h6 className="m-0">
            Contact Submissions ({filteredSubmissions.length} found)
          </h6>
          <span className="badge bg-primary">
            {submissions.filter((s) => !s.is_read).length} unread
          </span>
        </div>
        <div className="card-body">
          {filteredSubmissions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className={
                        submission.is_read === 0 ? "table-primary" : ""
                      }
                    >
                      <td>
                        {submission.is_read === 0 && (
                          <span className="badge bg-warning">New</span>
                        )}
                        {submission.responded === 1 && (
                          <span className="badge bg-success ms-1">Replied</span>
                        )}
                      </td>
                      <td>{submission.name}</td>
                      <td>{submission.email}</td>
                      <td>{submission.subject}</td>
                      <td>{formatDate(submission.submitted_at)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() =>
                              setSelectedSubmission(
                                selectedSubmission?.id === submission.id
                                  ? null
                                  : submission
                              )
                            }
                          >
                            View
                          </button>
                          <button
                            className={`btn ${
                              submission.is_read === 1
                                ? "btn-outline-warning"
                                : "btn-outline-success"
                            }`}
                            onClick={() =>
                              markAsRead(submission.id, submission.is_read)
                            }
                            title={
                              submission.is_read === 1
                                ? "Mark as Unread"
                                : "Mark as Read"
                            }
                          >
                            <FontAwesomeIcon
                              icon={
                                submission.is_read === 1 ? faEyeSlash : faEye
                              }
                            />
                          </button>
                          <button
                            className="btn btn-outline-info"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setResponseText(submission.response || "");
                            }}
                            title="Reply"
                          >
                            <FontAwesomeIcon icon={faReply} />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => deleteSubmission(submission.id)}
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <FontAwesomeIcon
                icon={faEnvelope}
                size="3x"
                className="text-muted mb-3"
              />
              <p className="text-muted">No contact submissions found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Message from {selectedSubmission.name}
                  {!selectedSubmission.is_read && (
                    <span className="badge bg-warning ms-2">Unread</span>
                  )}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSubmission(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Email:</strong> {selectedSubmission.email}
                  </div>
                  <div className="col-md-6">
                    <strong>Submitted:</strong>{" "}
                    {formatDate(selectedSubmission.submitted_at)}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Subject:</strong> {selectedSubmission.subject}
                </div>
                <div className="mb-3">
                  <strong>Message:</strong>
                  <div className="border p-3 mt-2 rounded">
                    {selectedSubmission.message}
                  </div>
                </div>

                {selectedSubmission.response && (
                  <div className="mb-3">
                    <strong>Your Response:</strong>
                    <div className="border p-3 mt-2 rounded bg-light">
                      {selectedSubmission.response}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="responseText" className="form-label">
                    <strong>Response:</strong>
                  </label>
                  <textarea
                    className="form-control"
                    id="responseText"
                    rows="4"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedSubmission(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => sendResponse(selectedSubmission.id)}
                  disabled={!responseText.trim()}
                >
                  <FontAwesomeIcon icon={faReply} className="me-2" />
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContact;
