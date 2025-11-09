import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Packages from './pages/Packages';
import Destination from './pages/Destination';
import Booking from './pages/Booking';
import Team from './pages/Team';
import Testimonial from './pages/Testimonial';
import Error from './pages/Error';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import AdminProfile from './pages/AdminProfile';
import PackageDetails from './pages/PackageDetails';
import PaymentPage from './pages/PaymentPage';
import { AuthProvider } from './components/AuthContext';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import MyBookings from './pages/MyBookings'; 
import PaymentHistory from './pages/PaymentHistory'; 
import CompletePayment from './components/user/CompletePayment';
import AdminPayments from './components/admin/AdminPayments';
import BookingPage from './pages/BookingPage';
import ReportsContent from './components/admin/ReportsContent';
import AdminContact from './components/admin/AdminContact';
import AdminAbout from './components/admin/AdminAbout';
import BookingsContent from './components/admin/BookingsContent';




// Component to handle routing and layout
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      <AuthProvider>
        {!isAdminRoute && !isLoginPage && <Header />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/destination" element={<Destination />} />
          
          <Route path="/team" element={<Team />} />
          <Route path="/testimonial" element={<Testimonial />} />
          <Route path="/error" element={<Error />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
          <Route path="/package/:id" element={<PackageDetails />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/complete-payment/:bookingId" element={<CompletePayment />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/reports" element={<ReportsContent />} />
          <Route path="/contact-management" element={<AdminContact />} />
          <Route path="/about" element={<AdminAbout />} />
          <Route path="/bookings" element={<BookingsContent />} />
        </Routes>

        {!isAdminRoute && !isLoginPage && <Footer />}
      </AuthProvider>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
