import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import TopNavigation from "../components/admin/TopNavigation";
import DashboardContent from "../components/admin/DashboardContent";
import PackagesContent from "../components/admin/PackagesContent";
import UsersContent from "../components/admin/UsersContent";
import BookingsContent from "../components/admin/BookingsContent";
import SettingsContent from "../components/admin/SettingsContent";
import DestinationsContent from "../components/admin/DestinationsContent";
import TestimonialsContent from "../components/admin/TestimonialsContent";
import AdminPayments from "../components/admin/AdminPayments";
import AdminContact from "../components/admin/AdminContact";
import AdminAbout from "../components/admin/AdminAbout";

import ReportsContent from "../components/admin/ReportsContent";
import Swal from "sweetalert2";

const apiURL = process.env.REACT_APP_API_URL;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminData, setAdminData] = useState(null);

  // Packages state
  const [packages, setPackages] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    destination_id: "",
    duration: "",
    price: "",
    inclusions: "",
    exclusions: "",
    is_featured: false,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Destinations state
  const [destinations, setDestinations] = useState([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [destinationsError, setDestinationsError] = useState(null);

  const navigate = useNavigate();

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setAdminData({
          id: 1,
          username: "Admin",
          email: "admin@gmail.com",
          role: "admin",
          created_at: "2025-07-28 14:55:21",
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    fetchAdminData();
  }, []);

  // Fetch packages when packages tab is active
  useEffect(() => {
    if (activeTab === "packages") {
      fetchPackages();
    }
  }, [activeTab]);

  // Fetch destinations when destinations tab is active
  useEffect(() => {
    if (activeTab === "destinations") {
      fetchDestinations();
    }
  }, [activeTab]);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/get_packages.php`
      );

      // Check content type before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Invalid response format: ${text}`);
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load packages");
      }
      setPackages(data.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    setDestinationsLoading(true);
    setDestinationsError(null);
    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/get_destinations.php`
      );

      // Check content type before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Invalid response format: ${text}`);
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load destinations");
      }
      setDestinations(data.data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      setDestinationsError(error.message);
    } finally {
      setDestinationsLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Package CRUD functions
  const handleEditClick = (pkg) => {
    setIsEditing(pkg.id);
    setEditFormData({
      name: pkg.name,
      destination_id: pkg.destination_id,
      duration: pkg.duration,
      price: pkg.price,
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      is_featured: pkg.is_featured || false,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditSubmit = async (pkgId) => {
    try {
      if (!pkgId) {
        throw new Error("Invalid or missing package ID");
      }

      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/update_package.php?id=${pkgId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editFormData,
            id: pkgId, // Ensure ID is included in the request body
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update package");
      }

      const data = await response.json();
      setPackages(packages.map((pkg) => (pkg.id === pkgId ? data : pkg)));
      setIsEditing(null);
      setShowAddForm(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Package updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating package:", error);
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleDeletePackage = async (pkgId) => {
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
          `${apiURL}/backend/server/admin_crud/delete_package.php?id=${pkgId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setPackages(packages.filter((pkg) => pkg.id !== pkgId));
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Package has been deleted.",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          throw new Error("Failed to delete package");
        }
      } catch (error) {
        console.error("Error deleting package:", error);
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const handleAddPackage = async (formData) => {
    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/add_package.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price),
            is_featured: formData.is_featured ? 1 : 0,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add package");
      }

      setPackages([...packages, data]);
      setShowAddForm(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Package added successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error adding package:", error);
      Swal.fire("Error", error.message, "error");
    }
  };

  // Destination CRUD functions to pass to DestinationsContent
  const handleAddDestination = async (destinationData) => {
    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/add_destination.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(destinationData),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add destination");
      }

      fetchDestinations();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateDestination = async (id, destinationData) => {
    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/update_destination.php?id=${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(destinationData),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update destination");
      }

      fetchDestinations();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteDestination = async (id) => {
    try {
      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/delete_destination.php?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete destination");
      }

      fetchDestinations();
    } catch (error) {
      throw error;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "packages":
        return (
          <PackagesContent
            packages={packages}
            destinations={destinations}
            loading={loading}
            error={error}
            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleEditClick={handleEditClick}
            handleEditFormChange={handleEditFormChange}
            handleEditSubmit={handleEditSubmit}
            handleDeletePackage={handleDeletePackage}
            handleAddPackage={handleAddPackage}
          />
        );
      case "destinations":
        return (
          <DestinationsContent
            destinations={destinations}
            loading={destinationsLoading}
            error={destinationsError}
            fetchDestinations={fetchDestinations}
            onAddDestination={handleAddDestination}
            onUpdateDestination={handleUpdateDestination}
          />
        );
      case "users":
        return <UsersContent />;
      case "bookings":
        return <BookingsContent />;
      case "testimonials":
        return <TestimonialsContent />;
      case "settings":
        return <SettingsContent />;
      case "admin/payments":
        return <AdminPayments />;
      case "reports":
        return <ReportsContent />;
      case "contact-management":
        return <AdminContact />;
      case "about":
        return <AdminAbout />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className="flex-grow-1 bg-light d-flex flex-column"
        style={{
          marginLeft: sidebarOpen ? "250px" : "80px",
          minHeight: "100vh",
        }}
      >
        <TopNavigation adminData={adminData} handleLogout={handleLogout} />

        <div
          className="flex-grow-1 overflow-auto p-3"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
