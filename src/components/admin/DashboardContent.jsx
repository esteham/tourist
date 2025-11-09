import React, { useEffect, useState } from 'react';
import { FaUsers, FaCalendarAlt, FaMoneyBillWave, FaHotel, FaChartLine, FaEye } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const apiURL = process.env.REACT_APP_API_URL;


const DashboardContent = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    confirmedBookings: 0,
    cancelledBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch bookings
        const bookingsRes = await fetch(`${apiURL}/backend/server/admin_crud/get_bookings.php`);
        const bookingsData = await bookingsRes.json();

        // Fetch users
        const usersRes = await fetch(`${apiURL}/backend/server/admin_crud/get_users.php`);
        const usersData = await usersRes.json();

        // Fetch packages to get names for bookings
        const packagesRes = await fetch(`${apiURL}/backend/server/admin_crud/get_packages.php`);
        const packagesData = await packagesRes.json();

        // Create a mapping of package IDs to names
        const packageMap = {};
        if (packagesData.data) {
          packagesData.data.forEach(pkg => {
            packageMap[pkg.id] = pkg.name;
          });
        }

        // Calculate stats
        const totalRevenue = bookingsData.data.reduce((sum, b) => {
          // Only count confirmed bookings for revenue
          if (b.status === 'confirmed' && b.payment_status === 'fully_paid') {
            return sum + parseFloat(b.total_price || 0);
          }
          return sum;
        }, 0);
        
        const activeUsers = usersData.data.filter(user => user.role !== 'admin').length;
        const totalBookings = bookingsData.data.length;
        const confirmedBookings = bookingsData.data.filter(b => b.status === 'confirmed').length;
        const cancelledBookings = bookingsData.data.filter(b => b.status === 'cancelled').length;
        
        // Add package names to bookings
        const bookingsWithPackageNames = bookingsData.data.map(booking => ({
          ...booking,
          package_name: packageMap[booking.package_id] || 'Unknown Package'
        }));

        // Generate sample revenue data for chart (in a real app, this would come from the backend)
        const monthlyRevenue = Array(12).fill(0).map((_, i) => ({
          month: new Date(0, i).toLocaleString('default', { month: 'short' }),
          revenue: Math.floor(Math.random() * 500000) + 100000
        }));

        setStats({
          totalBookings,
          totalRevenue,
          activeUsers,
          confirmedBookings,
          cancelledBookings
        });

        setRevenueData(monthlyRevenue);
        setRecentBookings(bookingsWithPackageNames.slice(0, 5));
      } catch (err) {
        console.error('Dashboard loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount).replace('BDT', '৳');
  };

  // Calculate percentages for progress bars
  const confirmedPercentage = stats.totalBookings > 0 ? 
    Math.round((stats.confirmedBookings / stats.totalBookings) * 100) : 0;
  
  const cancelledPercentage = stats.totalBookings > 0 ? 
    Math.round((stats.cancelledBookings / stats.totalBookings) * 100) : 0;
  
  const avgBookingValue = stats.totalBookings > 0 ? 
    stats.totalRevenue / stats.confirmedBookings : 0;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/*<h1 className="h3 mb-0 text-gray-800">Dashboard</h1>*/}
        <div className="d-none d-md-block">
          <span className="text-muted">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="row mb-4 g-4">
            {/* Total Bookings Card */}
            <div className="col-md-6 col-lg-3">
              <div className="card neomorphic-card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="icon-wrapper-left bg-primary">
                      <FaCalendarAlt size={24} className="text-white" />
                    </div>
                    <div className="text-end">
                      <h3 className="mb-0">{stats.totalBookings}</h3>
                      <p className="text-muted mb-0">Total Bookings</p>
                    </div>
                  </div>
                  <div className="progress mt-3" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-primary" 
                      role="progressbar" 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                  <small className="text-muted">
                    {stats.confirmedBookings} confirmed, {stats.cancelledBookings} cancelled
                  </small>
                </div>
              </div>
            </div>

            {/* Total Revenue Card */}
            <div className="col-md-6 col-lg-3">
              <div className="card neomorphic-card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="icon-wrapper-left bg-success">
                      <FaMoneyBillWave size={24} className="text-white" />
                    </div>
                    <div className="text-end">
                      <h3 className="mb-0">{formatCurrency(stats.totalRevenue)}</h3>
                      <p className="text-muted mb-0">Total Revenue</p>
                    </div>
                  </div>
                  <div className="progress mt-3" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                  <small className="text-muted">
                    From {stats.confirmedBookings} confirmed bookings
                  </small>
                </div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="col-md-6 col-lg-3">
              <div className="card neomorphic-card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="icon-wrapper-left bg-info">
                      <FaUsers size={24} className="text-white" />
                    </div>
                    <div className="text-end">
                      <h3 className="mb-0">{stats.activeUsers}</h3>
                      <p className="text-muted mb-0">Active Users</p>
                    </div>
                  </div>
                  <div className="progress mt-3" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-info" 
                      role="progressbar" 
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                  <small className="text-muted">Registered customers</small>
                </div>
              </div>
            </div>

            {/* Confirmed Bookings Card */}
            <div className="col-md-6 col-lg-3">
              <div className="card neomorphic-card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="icon-wrapper-left bg-warning">
                      <FaHotel size={24} className="text-white" />
                    </div>
                    <div className="text-end">
                      <h3 className="mb-0">{stats.confirmedBookings}</h3>
                      <p className="text-muted mb-0">Confirmed Bookings</p>
                    </div>
                  </div>
                  <div className="progress mt-3" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      role="progressbar" 
                      style={{ width: `${confirmedPercentage}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">{confirmedPercentage}% of total bookings</small>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart and Quick Stats */}
          <div className="row mb-4 g-4">
            <div className="col-lg-8">
              <div className="card neomorphic-card h-100">
                <div className="card-header bg-transparent">
                  <h5 className="mb-0">Revenue Overview</h5>
                </div>
                <div className="card-body">
                  <div className="chart-container" style={{ height: '300px' }}>
                    <div className="d-flex align-items-end justify-content-around" style={{ height: '100%' }}>
                      {revenueData.map((month, index) => (
                        <div key={index} className="d-flex flex-column align-items-center" style={{ width: '8%' }}>
                          <div 
                            className="bg-primary rounded-top" 
                            style={{
                              width: '100%',
                              height: `${(month.revenue / 500000) * 100}%`,
                              minHeight: '5px',
                              transition: 'height 0.5s ease'
                            }}
                            title={`${month.month}: ${formatCurrency(month.revenue)}`}
                          ></div>
                          <small className="text-muted mt-1">{month.month}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">
                      <FaChartLine className="me-1 text-success" />
                      <span>Monthly revenue distribution</span>
                    </small>
                    <small className="text-muted">Sample data</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card neomorphic-card h-100">
                <div className="card-header bg-transparent">
                  <h5 className="mb-0">Quick Stats</h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Total Bookings</span>
                      <span className="badge bg-primary rounded-pill">
                        {stats.totalBookings}
                      </span>
                    </li>
                    
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Cancellation Rate</span>
                      <span className="badge bg-danger rounded-pill">
                        {cancelledPercentage}%
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Confirmed Rate</span>
                      <span className="badge bg-success rounded-pill">
                        {confirmedPercentage}%
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span>Avg. Booking Value</span>
                      <span>{formatCurrency(avgBookingValue)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="card neomorphic-card">
            <div className="card-header bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Bookings</h5>
                 <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate('/bookings')}  // <-- এখানে তোমার route
                  >
                    <FaEye className="me-1" /> View All
                  </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th className="text-center">Package</th>
                      <th className="text-center">Date</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length > 0 ? (
                      recentBookings.map(booking => (
                        <tr key={booking.id}>
                          <td className="fw-bold">#{booking.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              
                              <div>
                                <h6 className="mb-0">{booking.customer_name}</h6>
                                <small className="text-muted">{booking.customer_email}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">{booking.package_name}</td>
                          <td className="text-center">
                            {new Date(booking.booking_date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="text-center">
                            <span className={`badge rounded-pill ${
                              booking.status === 'confirmed' ? 'bg-success' :
                              booking.status === 'cancelled' ? 'bg-danger' :
                              'bg-warning text-dark'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="text-center fw-bold">
                            {formatCurrency(booking.total_price)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">
                          No recent bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS for neomorphic design */}
      <style jsx>{`
        .neomorphic-card {
          background: #e4ebf5;
          border-radius: 10px;
          box-shadow: 10px 10px 20px #babecc, -10px -10px 20px #ffffff;
          border: none;
          transition: all 0.3s ease;
        }
        
        .neomorphic-card:hover {
          box-shadow: 8px 8px 15px #babecc, -8px -8px 15px #ffffff;
          transform: translateY(-2px);
        }
        
        .icon-wrapper-left {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 5px 5px 10px #babecc, -5px -5px 10px #ffffff;
        }
        
        .progress {
          background-color: #e4ebf5;
          box-shadow: inset 2px 2px 5px #babecc, inset -5px -5px 10px #ffffff;
          border-radius: 20px;
        }

        .avatar-title {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default DashboardContent;