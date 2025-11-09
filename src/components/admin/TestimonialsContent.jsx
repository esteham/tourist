import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const apiURL = process.env.REACT_APP_API_URL;

const TestimonialsContent = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(
        `${apiURL}/backend/server/getTestimonials.php`,
        {
          credentials: "include",
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.success) {
        setTestimonials(data.testimonials);
      } else {
        throw new Error(data.message || "Failed to fetch testimonials");
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load testimonials",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const deleteTestimonial = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${apiURL}/backend/server/admin_crud/delete_testimonial.php?id=${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to delete testimonial");
        }

        await fetchTestimonials();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Testimonial has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete testimonial",
        });
      }
    }
  };

  // Internal CSS Styles
  const styles = {
    container: {
      padding: "24px",
      backgroundColor: "#f9fafb",
      minHeight: "100vh",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    },
    header: {
      marginBottom: "32px",
    },
    headerTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    headerSubtitle: {
      color: "#6b7280",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "32px",
    },
    statCard: {
      background: "white",
      padding: "24px",
      borderRadius: "8px",
      textAlign: "center",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    statNumber: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    statLabel: {
      fontSize: "14px",
      color: "#374151",
    },
    tableContainer: {
      background: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    tableHeader: {
      padding: "16px 24px",
      borderBottom: "1px solid #e5e7eb",
    },
    tableHeaderTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHead: {
      backgroundColor: "#f9fafb",
    },
    tableHeaderCell: {
      padding: "12px 24px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "500",
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    tableRow: {
      borderBottom: "1px solid #e5e7eb",
      transition: "background-color 0.2s ease",
    },
    tableRowHover: {
      backgroundColor: "#f9fafb",
    },
    tableCell: {
      padding: "16px 24px",
      fontSize: "14px",
    },
    userAvatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "#3b82f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: "14px",
    },
    rating: {
      color: "#f59e0b",
      fontSize: "14px",
    },
    deleteButton: {
      color: "#dc2626",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "4px",
      transition: "background-color 0.2s ease",
    },
    deleteButtonHover: {
      backgroundColor: "#fef2f2",
    },
    emptyState: {
      textAlign: "center",
      padding: "48px 24px",
    },
    emptyStateIcon: {
      width: "64px",
      height: "64px",
      color: "#9ca3af",
      marginBottom: "16px",
    },
    emptyStateTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "8px",
    },
    emptyStateText: {
      color: "#6b7280",
    },
    loadingSpinner: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "256px",
    },
    spinner: {
      width: "48px",
      height: "48px",
      border: "3px solid #f3f3f3",
      borderTop: "3px solid #3b82f6",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingSpinner}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Customer Reviews</h2>
        {/*<p style={styles.headerSubtitle}>Manage and review customer feedback and ratings</p>*/}
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, backgroundColor: "#dbeafe" }}>
          <div style={{ ...styles.statNumber, color: "#2563eb" }}>
            {testimonials.length}
          </div>
          <div style={styles.statLabel}>Total Reviews</div>
        </div>
        <div style={{ ...styles.statCard, backgroundColor: "#d1fae5" }}>
          <div style={{ ...styles.statNumber, color: "#059669" }}>
            {testimonials.filter((t) => t.rating >= 4).length}
          </div>
          <div style={styles.statLabel}>Positive Reviews (4+ stars)</div>
        </div>
        <div style={{ ...styles.statCard, backgroundColor: "#fef3c7" }}>
          <div style={{ ...styles.statNumber, color: "#d97706" }}>
            {testimonials.filter((t) => t.rating === 3).length}
          </div>
          <div style={styles.statLabel}>Neutral Reviews</div>
        </div>
        <div style={{ ...styles.statCard, backgroundColor: "#fee2e2" }}>
          <div style={{ ...styles.statNumber, color: "#dc2626" }}>
            {testimonials.filter((t) => t.rating <= 2).length}
          </div>
          <div style={styles.statLabel}>Critical Reviews</div>
        </div>
      </div>

      {/* Testimonials Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableHeaderTitle}>All Reviews</h2>
        </div>

        {testimonials.length === 0 ? (
          <div style={styles.emptyState}>
            <svg
              style={styles.emptyStateIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h3 style={styles.emptyStateTitle}>No reviews yet</h3>
            <p style={styles.emptyStateText}>
              Customer reviews will appear here once they are submitted.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.tableHeaderCell}>User & Rating</th>
                  <th style={styles.tableHeaderCell}>Comment</th>
                  <th style={styles.tableHeaderCell}>Date</th>
                  <th style={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr key={t.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={styles.userAvatar}>
                          {(t.username || "UU").charAt(0).toUpperCase()}
                        </div>
                        <div style={{ marginLeft: "16px" }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#111827",
                            }}
                          >
                            {t.username || "Unknown User"}
                          </div>
                          <div style={styles.rating}>
                            {"★".repeat(t.rating)}
                            {"☆".repeat(5 - t.rating)}
                            <span
                              style={{
                                marginLeft: "8px",
                                color: "#6b7280",
                                fontSize: "12px",
                              }}
                            >
                              ({t.rating}/5)
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#111827",
                          maxWidth: "400px",
                        }}
                      >
                        {t.content}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{ fontSize: "14px", color: "#6b7280" }}>
                        {new Date(t.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => deleteTestimonial(t.id)}
                        style={styles.deleteButton}
                        title="Delete review"
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = "#fef2f2";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add CSS animation for spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default TestimonialsContent;
