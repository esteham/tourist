import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const apiURL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [availableTours, setAvailableTours] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from local storage or auth check
    const fetchUserData = async () => {
      try {
        // First try to get from local storage (fast)
        const authData = JSON.parse(localStorage.getItem("auth"));
        if (authData?.isAuthenticated && authData?.user?.username) {
          setUsername(authData.user.username);
        } else {
          // If not in local storage, check auth status (like your Header does)
          const response = await fetch(
            `${apiURL}/backend/server/check_auth.php`,
            {
              credentials: "include",
            }
          );
          const result = await response.json();

          if (result.authenticated && result.user?.username) {
            setUsername(result.user.username);
            // Update local storage
            localStorage.setItem(
              "auth",
              JSON.stringify({
                isAuthenticated: true,
                user: {
                  id: result.user.id,
                  username: result.user.username,
                  email: result.user.email,
                  role: result.user.role,
                },
              })
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    // Simulate API call to fetch booking stats
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAvailableTours(12);
        setUpcomingBookings(5);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        color: "#1e293b",
        minHeight: "100vh",
      }}
    >
      {/* Welcome Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          color: "white",
          padding: "4rem 0 3rem",
          marginBottom: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path fill='rgba(255,255,255,0.05)' d='M0,0 L100,0 L100,100 L0,100 Z' /></svg>\")",
            backgroundSize: "cover",
            opacity: 0.1,
          }}
        ></div>

        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div style={{ position: "relative", zIndex: 2 }}>
                <h1
                  style={{
                    fontWeight: 700,
                    fontSize: "2.5rem",
                    marginBottom: "1rem",
                    lineHeight: 1.3,
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(90deg, #fff, #e0f2fe)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "textShine 3s ease infinite",
                    }}
                  >
                    Welcome {username}!
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      animation: "bounce 2s ease infinite",
                    }}
                  >
                    👋🏻
                  </span>
                </h1>
                <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                  Explore amazing travel destinations and manage your bookings
                </p>
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "-20px",
                    opacity: 0.1,
                    pointerEvents: "none",
                  }}
                >
                  <i
                    className="fas fa-plane"
                    style={{
                      fontSize: "8rem",
                      position: "absolute",
                      top: "20%",
                      left: "10%",
                    }}
                  ></i>
                  <i
                    className="fas fa-umbrella-beach"
                    style={{
                      fontSize: "8rem",
                      position: "absolute",
                      top: "40%",
                      left: "30%",
                    }}
                  ></i>
                  <i
                    className="fas fa-hotel"
                    style={{
                      fontSize: "8rem",
                      position: "absolute",
                      top: "60%",
                      left: "15%",
                    }}
                  ></i>
                  <i
                    className="fas fa-suitcase"
                    style={{
                      fontSize: "8rem",
                      position: "absolute",
                      top: "30%",
                      left: "50%",
                    }}
                  ></i>
                </div>
              </div>
            </div>
            <div className="col-lg-4 mt-4 mt-lg-0">
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  padding: "1.5rem",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  position: "relative",
                  overflow: "hidden",
                  zIndex: 1,
                }}
              >
                <div style={{ position: "relative", zIndex: 2 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      marginTop: "1rem",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.1)",
                        padding: "1rem",
                        borderRadius: "12px",
                        backdropFilter: "blur(5px)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                          fontSize: "0.9rem",
                          opacity: 0.9,
                        }}
                      >
                        <i
                          className="fas fa-plane"
                          style={{ color: "#3b82f6" }}
                        ></i>
                        <span>Available Package</span>
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "1.5rem",
                          margin: "5px 0",
                        }}
                      >
                        {availableTours}
                      </div>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.1)",
                        padding: "1rem",
                        borderRadius: "12px",
                        backdropFilter: "blur(5px)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                          fontSize: "0.9rem",
                          opacity: 0.9,
                        }}
                      >
                        <i
                          className="fas fa-calendar-check"
                          style={{ color: "#3b82f6" }}
                        ></i>
                        <span>Your Bookings</span>
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "1.5rem",
                          margin: "5px 0",
                        }}
                      >
                        {upcomingBookings}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "1.5rem",
                    }}
                  >
                    <button
                      onClick={() => navigate("/packages")}
                      style={{
                        flex: 1,
                        padding: "0.8rem",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        fontWeight: 500,
                        textDecoration: "none",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(5px)",
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fas fa-plus-circle"></i>
                      <span style={{ fontSize: "17px", fontWeight: "bold" }}>
                        Book a Package
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "60px",
                    overflow: "hidden",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      borderRadius: "50%",
                      opacity: 0.08,
                      background: "#2563eb",
                      width: "120px",
                      height: "120px",
                      bottom: "-60px",
                      left: "-30px",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      borderRadius: "50%",
                      opacity: 0.08,
                      background: "#10b981",
                      width: "80px",
                      height: "80px",
                      bottom: "-40px",
                      right: "-20px",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "3rem" }}>
        {/* Popular Destinations Section */}
        {/*<div style={{ 
          background: 'white',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
          marginBottom: '3rem'
        }}>
          <h2 style={{ 
            fontWeight: 600,
            fontSize: '1.6rem',
            marginBottom: '2rem',
            color: '#1e293b',
            position: 'relative',
            display: 'inline-block'
          }}>
            Popular Destinations
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
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <div 
                className="destination-card"
                style={{ 
                  border: 'none',
                  borderRadius: '14px',
                  padding: '2rem 1.5rem',
                  transition: 'all 0.4s ease',
                  height: '100%',
                  textAlign: 'center',
                  background: '#f8fafc',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  ':hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)'
                  }
                }}
                onClick={() => navigate('/destination/thailand')}
              >
                <div style={{ 
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '1.8rem',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb'
                }}>
                  <i className="fas fa-umbrella-beach"></i>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem' }}>Thailand</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Beautiful beaches and temples</p>
                <div style={{ 
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: 'none',
                  transition: 'all 0.3s ease',
                  marginTop: 'auto',
                  alignSelf: 'center',
                  width: 'fit-content',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                }}>
                  <i className="fas fa-eye me-2"></i> View Packages
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div 
                className="destination-card"
                style={{ 
                  border: 'none',
                  borderRadius: '14px',
                  padding: '2rem 1.5rem',
                  transition: 'all 0.4s ease',
                  height: '100%',
                  textAlign: 'center',
                  background: '#f8fafc',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  ':hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)'
                  }
                }}
                onClick={() => navigate('/destination/bali')}
              >
                <div style={{ 
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '1.8rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981'
                }}>
                  <i className="fas fa-island-tropical"></i>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem' }}>Bali</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Tropical paradise in Indonesia</p>
                <div style={{ 
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: 'none',
                  transition: 'all 0.3s ease',
                  marginTop: 'auto',
                  alignSelf: 'center',
                  width: 'fit-content',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                }}>
                  <i className="fas fa-eye me-2"></i> View Packages
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div 
                className="destination-card"
                style={{ 
                  border: 'none',
                  borderRadius: '14px',
                  padding: '2rem 1.5rem',
                  transition: 'all 0.4s ease',
                  height: '100%',
                  textAlign: 'center',
                  background: '#f8fafc',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  ':hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)'
                  }
                }}
                onClick={() => navigate('/destination/darjeeling')}
              >
                <div style={{ 
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '1.8rem',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#f59e0b'
                }}>
                  <i className="fas fa-mountain"></i>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem' }}>Darjeeling</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Queen of the Himalayas</p>
                <div style={{ 
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: 'none',
                  transition: 'all 0.3s ease',
                  marginTop: 'auto',
                  alignSelf: 'center',
                  width: 'fit-content',
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#f59e0b',
                }}>
                  <i className="fas fa-eye me-2"></i> View Packages
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div 
                className="destination-card"
                style={{ 
                  border: 'none',
                  borderRadius: '14px',
                  padding: '2rem 1.5rem',
                  transition: 'all 0.4s ease',
                  height: '100%',
                  textAlign: 'center',
                  background: '#f8fafc',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  ':hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)'
                  }
                }}
                onClick={() => navigate('/destination/agra')}
              >
                <div style={{ 
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '1.8rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444'
                }}>
                  <i className="fas fa-monument"></i>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem' }}>Agra</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Home of the Taj Mahal
                </p>
                <div style={{ 
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: 'none',
                  transition: 'all 0.3s ease',
                  marginTop: 'auto',
                  alignSelf: 'center',
                  width: 'fit-content',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                }}>
                  <i className="fas fa-eye me-2"></i> View Packages
                </div>
              </div>
            </div>
          </div>
        </div>*/}

        {/* Quick Actions Section */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "2.5rem",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              fontWeight: 600,
              fontSize: "1.6rem",
              marginBottom: "2rem",
              color: "#1e293b",
              position: "relative",
              display: "inline-block",
            }}
          >
            Quick Access
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
          <div className="row">
            <div className="col-lg-6 mb-4">
              <div
                style={{
                  borderLeft: "4px solid #2563eb",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  background: "white",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  gap: "15px",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  ":hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                  },
                }}
                onClick={() => navigate("/my-bookings")}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    position: "relative",
                    zIndex: 1,
                    flexShrink: 0,
                    background: "rgba(37, 99, 235, 0.1)",
                    color: "#2563eb",
                  }}
                >
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div style={{ position: "relative", zIndex: 1, flexGrow: 1 }}>
                  <h4
                    style={{
                      fontWeight: 600,
                      fontSize: "1.2rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    My Bookings
                  </h4>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    View and manage your upcoming trips
                  </p>
                  <div
                    style={{
                      padding: "0.5rem 1.25rem",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      transition: "all 0.3s ease",
                      display: "inline-block",
                      background: "rgba(37, 99, 235, 0.1)",
                      color: "#2563eb",
                      border: "1px solid rgba(37, 99, 235, 0.2)",
                    }}
                  >
                    View Bookings <i className="fas fa-arrow-right ms-2"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div
                style={{
                  borderLeft: "4px solid #10b981",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  background: "white",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  gap: "15px",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  ":hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                  },
                }}
                onClick={() => navigate("/payment-history")}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    position: "relative",
                    zIndex: 1,
                    flexShrink: 0,
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                  }}
                >
                  <i className="fas fa-receipt"></i>
                </div>
                <div style={{ position: "relative", zIndex: 1, flexGrow: 1 }}>
                  <h4
                    style={{
                      fontWeight: 600,
                      fontSize: "1.2rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Payment History
                  </h4>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    View your payment receipts and history
                  </p>
                  <div
                    style={{
                      padding: "0.5rem 1.25rem",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      transition: "all 0.3s ease",
                      display: "inline-block",
                      background: "rgba(16, 185, 129, 0.1)",
                      color: "#10b981",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    View History <i className="fas fa-arrow-right ms-2"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div
                style={{
                  borderLeft: "4px solid #06b6d4",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  background: "white",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  gap: "15px",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  ":hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                  },
                }}
                onClick={() => navigate("/edit-profile")}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    position: "relative",
                    zIndex: 1,
                    flexShrink: 0,
                    background: "rgba(59, 130, 246, 0.1)",
                    color: "#06b6d4",
                  }}
                >
                  <i className="fas fa-user-circle"></i>
                </div>
                <div style={{ position: "relative", zIndex: 1, flexGrow: 1 }}>
                  <h4
                    style={{
                      fontWeight: 600,
                      fontSize: "1.2rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    My Profile
                  </h4>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    Update your personal information
                  </p>
                  <div
                    style={{
                      padding: "0.5rem 1.25rem",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      transition: "all 0.3s ease",
                      display: "inline-block",
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "#06b6d4",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    Edit Profile <i className="fas fa-arrow-right ms-2"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div
                style={{
                  borderLeft: "4px solid #06b6d4",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  background: "white",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  gap: "15px",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  ":hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                  },
                }}
                onClick={() => navigate("/change-password")}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    position: "relative",
                    zIndex: 1,
                    flexShrink: 0,
                    background: "rgba(59, 130, 246, 0.1)",
                    color: "#06b6d4",
                  }}
                >
                  <i className="fas fa-user-circle"></i>
                </div>
                <div style={{ position: "relative", zIndex: 1, flexGrow: 1 }}>
                  <h4
                    style={{
                      fontWeight: 600,
                      fontSize: "1.2rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Change Password
                  </h4>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    Update your password
                  </p>
                  <div
                    style={{
                      padding: "0.5rem 1.25rem",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      transition: "all 0.3s ease",
                      display: "inline-block",
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "#06b6d4",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    Edit Password <i className="fas fa-arrow-right ms-2"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes textShine {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          @media (max-width: 992px) {
            .welcome-message {
              font-size: 2rem;
            }
            
            .popular-destinations, .quick-actions {
              padding: 2rem;
            }
          }

          @media (max-width: 768px) {
            .welcome-section {
              padding: 3rem 0;
            }
            
            .welcome-message {
              font-size: 1.8rem;
            }
            
            .destination-card {
              margin-bottom: 1.5rem;
            }
            
            .popular-destinations, .quick-actions {
              padding: 1.75rem;
            }
          }

          @media (max-width: 576px) {
            .welcome-message {
              font-size: 1.6rem;
            }
            
            .popular-destinations, .quick-actions {
              padding: 1.5rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
