import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

const apiURL = process.env.REACT_APP_API_URL;

const ReportsContent = () => {
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const printRef = useRef();

  const fetchReports = () => {
    setLoading(true);
    let url = `${apiURL}/backend/server/admin_crud/getReports.php?search=${search}&status=${status}&startDate=${startDate}&endDate=${endDate}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSummary(data.summary);
          setDetails(data.details);
        } else {
          Swal.fire("Error", data.message, "error");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=1000,height=700");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Report - Tourist Travel Agency</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              line-height: 1.4;
              padding: 15px;
              margin: 0;
            }
            .print-header {
              text-align: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #2c3e50;
            }
            .print-header h2 {
              color: #2c3e50;
              margin: 0;
              font-size: 24px;
            }
            .print-header h3 {
              color: #7f8c8d;
              margin: 5px 0;
              font-weight: normal;
              font-size: 16px;
            }
            .date-range {
              text-align: center;
              margin: 10px 0 15px;
              font-style: italic;
              color: #666;
              font-size: 14px;
            }
            .summary-cards { 
              display: flex; 
              flex-wrap: wrap;
              justify-content: space-between; 
              margin: 15px 0; 
            }
            .card { 
              padding: 15px; 
              border-radius: 8px; 
              color: white; 
              flex: 1; 
              margin: 5px; 
              min-width: 180px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .bg-success { background: linear-gradient(to right, #28a745, #20c997); }
            .bg-info { background: linear-gradient(to right, #17a2b8, #45aaf2); }
            .bg-warning { background: linear-gradient(to right, #ffc107, #ffce3a); color: #000; }
            .bg-primary { background: linear-gradient(to right, #007bff, #5352ed); }
            .card h5 { margin: 0 0 8px 0; font-size: 14px; }
            .card p { margin: 0; font-size: 18px; font-weight: bold; }
            .card small { font-size: 12px; }
            
            .section-title {
              background-color: #f8f9fa;
              padding: 8px 12px;
              border-left: 4px solid #2c3e50;
              margin: 20px 0 10px;
              font-weight: bold;
              color: #2c3e50;
              font-size: 16px;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 8px; 
              margin-bottom: 20px;
              font-size: 12px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background: #2c3e50; 
              color: white;
              font-weight: 600;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: 11px; 
              color: #7f8c8d;
            }
            .signature { 
              margin-top: 40px; 
              text-align: right; 
              font-size: 12px; 
            }
            .text-end {
              text-align: right;
            }
            .fw-bold {
              font-weight: bold;
            }
            .text-success {
              color: #28a745;
            }
            .text-warning {
              color: #ffc107;
            }
            .text-danger {
              color: #dc3545;
            }
            .text-muted {
              color: #6c757d;
            }
            .badge {
              display: inline-block;
              padding: 0.25em 0.4em;
              font-size: 75%;
              font-weight: 700;
              line-height: 1;
              text-align: center;
              white-space: nowrap;
              vertical-align: baseline;
              border-radius: 0.25rem;
            }
            .bg-light {
              background-color: #f8f9fa!important;
            }
            .text-dark {
              color: #212529!important;
            }
            
            @media print {
              body {
                padding: 10px;
                margin: 0;
                size: portrait;
              }
              .summary-cards {
                page-break-inside: avoid;
              }
              table {
                page-break-inside: avoid;
                font-size: 11px;
              }
              .card {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h2>Tourist Travel Agency</h2>
            <h3>Payments Report</h3>
          </div>
          <p class="date-range">Date Range: ${startDate || "All"} - ${
      endDate || "All"
    }</p>
          ${printContent}
          <div class="footer">
            Generated at: ${new Date().toLocaleString()}
          </div>
          <div class="signature">
            ___________________<br/>
            Authorized Signature
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      // Don't close immediately to allow print dialog to show properly
    }, 250);
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    fetchReports();
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading report data...</p>
        </div>
      </div>
    );

  // Split into tables
  const fullyPaid = details.filter((d) => d.payment_status === "fully_paid");
  const depositPaid = details.filter(
    (d) => d.payment_status === "deposit_paid"
  );
  const duePayments = details.filter((d) => d.due_amount > 0);

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Payments Report</h2>
          {/*<p className="text-muted">View and analyze payment records</p>*/}
        </div>
        <div className="col-md-4 text-end">
          <button className="btn btn-primary me-2" onClick={fetchReports}>
            Refresh
          </button>
          <button className="btn btn-dark" onClick={handlePrint}>
            Print Report
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Filters</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleFilter}>
            <div className="row g-3">
              <div className="col-md-3">
                <label htmlFor="search" className="form-label">
                  Search
                </label>
                <div className="input-group">
                  <span className="input-group-text">🔍</span>
                  <input
                    type="text"
                    className="form-control"
                    id="search"
                    placeholder="Customer or package"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  className="form-select"
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="fully_paid">Fully Paid</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="due">Due Payments</option>
                </select>
              </div>

              <div className="col-md-3">
                <label htmlFor="startDate" className="form-label">
                  Start Date
                </label>
                <div className="input-group">
                  <span className="input-group-text">📅</span>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <label htmlFor="endDate" className="form-label">
                  End Date
                </label>
                <div className="input-group">
                  <span className="input-group-text">📅</span>
                  <input
                    type="date"
                    className="form-control"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-12 text-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={clearFilters}
                >
                  Clear
                </button>
                <button type="submit" className="btn btn-primary">
                  Apply Filters
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Report Content for Printing */}
      <div ref={printRef} className="print-content">
        {/* Summary Cards with requested box-shadow */}
        <div className="row g-4 mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card neomorphic-card text-dark p-3 rounded-3 h-100">
              <div className="card-body text-center">
                <h5 className="text-success">Fully Paid</h5>
                <p className="fs-4 fw-bold">
                  ৳ {parseFloat(summary.total_fully_paid).toFixed(2)}
                </p>
                <small>{fullyPaid.length} bookings</small>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card neomorphic-card text-dark p-3 rounded-3 h-100">
              <div className="card-body text-center">
                <h5 className="text-warning">Deposit Paid</h5>
                <p className="fs-4 fw-bold">
                  ৳ {parseFloat(summary.total_deposit_paid).toFixed(2)}
                </p>
                <small>{depositPaid.length} bookings</small>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card neomorphic-card text-dark p-3 rounded-3 h-100">
              <div className="card-body text-center">
                <h5 className="text-danger">Due Payment</h5>
                <p className="fs-4 fw-bold">
                  ৳ {parseFloat(summary.total_due).toFixed(2)}
                </p>
                <small>{duePayments.length} bookings</small>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card neomorphic-card text-dark p-3 rounded-3 h-100">
              <div className="card-body text-center">
                <h5 className="text-primary">Total Revenue</h5>
                <p className="fs-4 fw-bold">
                  ৳ {parseFloat(summary.grand_total).toFixed(2)}
                </p>
                <small>{details.length} total bookings</small>
              </div>
            </div>
          </div>
        </div>

        {/* Fully Paid Table */}
        <div className="mb-5">
          <h4 className="mb-3 pb-2 text-success border-bottom border-success">
            Fully Paid
          </h4>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Method</th>
                  <th className="text-end">Paid Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {fullyPaid.length > 0 ? (
                  fullyPaid.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-bold">#{r.id}</td>
                      <td>{r.customer_name}</td>
                      <td>{r.package_name}</td>
                      <td>
                        <span className="text-dark">{r.payment_method}</span>
                      </td>
                      <td className="text-end fw-bold text-success">
                        ৳ {parseFloat(r.paid_amount).toFixed(2)}
                      </td>
                      <td>{r.booking_date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No fully paid records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deposit Paid Table */}
        <div className="mb-5">
          <h4 className="mb-3 pb-2 text-info border-bottom border-info">
            Deposit Paid
          </h4>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Method</th>
                  <th className="text-end">Deposit</th>
                  <th className="text-end">Due</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {depositPaid.length > 0 ? (
                  depositPaid.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-bold">#{r.id}</td>
                      <td>{r.customer_name}</td>
                      <td>{r.package_name}</td>
                      <td>
                        <span className="text-dark">{r.payment_method}</span>
                      </td>
                      <td className="text-end">
                        ৳ {parseFloat(r.deposit_amount).toFixed(2)}
                      </td>
                      <td className="text-end fw-bold text-warning">
                        ৳ {parseFloat(r.due_amount).toFixed(2)}
                      </td>
                      <td>{r.booking_date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No deposit paid records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Due Payments Table */}
        <div className="mb-4">
          <h4 className="mb-3 pb-2 text-warning border-bottom border-warning">
            Due Payments
          </h4>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Method</th>
                  <th className="text-end">Total</th>
                  <th className="text-end">Due</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {duePayments.length > 0 ? (
                  duePayments.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-bold">#{r.id}</td>
                      <td>{r.customer_name}</td>
                      <td>{r.package_name}</td>
                      <td>
                        <span className="text-dark">{r.payment_method}</span>
                      </td>
                      <td className="text-end">
                        ৳ {parseFloat(r.total_price).toFixed(2)}
                      </td>
                      <td className="text-end fw-bold text-danger">
                        ৳ {parseFloat(r.due_amount).toFixed(2)}
                      </td>
                      <td>{r.booking_date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No due payment records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print button at bottom */}
      {/*<div className="text-center mt-4 d-print-none">
        <button className="btn btn-primary btn-lg" onClick={handlePrint}>
          Print Report
        </button>
      </div>*/}

      {/* Print Styles */}
      <style>
        {`
        	.neomorphic-card {
			  background: #e4ebf5;
			  border-radius: 10px;
			  box-shadow: 10px 10px 20px #babecc, -10px -10px 20px #ffffff;
			  border: none;
			  transition: all 0.3s ease;
			}
			

          @media print {
            .btn, .card-header, .input-group, .form-label, .text-muted {
              display: none !important;
            }
            .print-content {
              display: block !important;
            }
            body {
              padding: 0;
              background: white;
            }
            .container-fluid {
              padding: 0;
            }
            .card {
              border: none !important;
            }
            .bg-success, .bg-info, .bg-warning, .bg-primary {
              color: white !important;
              -webkit-print-color-adjust: exact;
            }
            .table-dark {
              background-color: #2c3e50 !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
            }
            .table-striped tbody tr:nth-of-type(odd) {
              background-color: rgba(0,0,0,.05) !important;
              -webkit-print-color-adjust: exact;
            }
          }
          @media screen {
            .print-content {
              border: 1px solid #dee2e6;
              border-radius: 8px;
              padding: 25px;
              background: white;
              box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReportsContent;
