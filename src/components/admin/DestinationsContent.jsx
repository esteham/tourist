import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const apiURL = process.env.REACT_APP_API_URL;

const DestinationsContent = ({
  destinations,
  loading,
  error,
  fetchDestinations, // Make sure this prop is passed from parent
  onAddDestination, // New prop for handling add
  onUpdateDestination, // New prop for handling update
}) => {
  const [isEditing, setIsEditing] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    location: "",
    price: "",
    image_url: "",
    is_featured: false,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const handleEditClick = (destination) => {
    setIsEditing(destination.id);
    setEditFormData({
      name: destination.name,
      description: destination.description,
      location: destination.location,
      price: destination.price,
      image_url: destination.image_url,
      is_featured: destination.is_featured,
    });
    setImagePreview(destination.image_url || null);
    setShowAddForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setEditFormData((prev) => ({
          ...prev,
          image_url: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!editFormData.name.trim()) errors.name = "Name is required";
    if (!editFormData.description.trim())
      errors.description = "Description is required";
    if (!editFormData.location.trim()) errors.location = "Location is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const response = await fetch(
        isEditing
          ? `${apiURL}/backend/server/admin_crud/update_destination.php?id=${isEditing}`
          : `${apiURL}/backend/server/admin_crud/add_destination.php`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editFormData.name,
            description: editFormData.description,
            location: editFormData.location,
            price: editFormData.price ? parseFloat(editFormData.price) : 0, // Handle empty price
            image_url: editFormData.image_url || null,
            is_featured: editFormData.is_featured ? 1 : 0,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save destination");
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: isEditing
          ? "Destination updated successfully"
          : "Destination added successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowAddForm(false);
      setIsEditing(null);
      fetchDestinations();
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleDeleteDestination = async (destId) => {
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
          `${apiURL}/backend/server/admin_crud/delete_destination.php?id=${destId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          fetchDestinations();
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Destination has been deleted.",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          throw new Error("Failed to delete destination");
        }
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Destination Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setIsEditing(null);
            setEditFormData({
              name: "",
              description: "",
              location: "",
              price: "",
              image_url: "",
              is_featured: false,
            });
            setImagePreview(null);
          }}
          disabled={loading}
        >
          <FontAwesomeIcon
            icon={showAddForm ? faTimes : faPlus}
            className="me-2"
          />
          {showAddForm ? "Cancel" : "Add New Destination"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>{isEditing ? "Edit Destination" : "Add New Destination"}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Destination Name*</label>
                  <input
                    type="text"
                    className={`form-control ${
                      formErrors.name && "is-invalid"
                    }`}
                    name="name"
                    value={editFormData.name}
                    onChange={handleFormChange}
                  />
                  {formErrors.name && (
                    <div className="invalid-feedback">{formErrors.name}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Location*</label>
                  <input
                    type="text"
                    className={`form-control ${
                      formErrors.location && "is-invalid"
                    }`}
                    name="location"
                    value={editFormData.location}
                    onChange={handleFormChange}
                  />
                  {formErrors.location && (
                    <div className="invalid-feedback">
                      {formErrors.location}
                    </div>
                  )}
                </div>
              </div>

              {/*<div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={editFormData.price}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>*/}

              <div className="mb-3">
                <label className="form-label">Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="img-thumbnail"
                      style={{ maxHeight: "200px" }}
                    />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Description*</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={editFormData.description}
                  onChange={handleFormChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="is_featured"
                  id="is_featured"
                  checked={editFormData.is_featured}
                  onChange={handleFormChange}
                />
                <label className="form-check-label" htmlFor="is_featured">
                  Featured Destination
                </label>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setShowAddForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} className="me-2" />
                      {isEditing ? "Update Destination" : "Save Destination"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && destinations.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading destinations...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                {/*<th>ID</th>*/}
                <th>Name</th>
                <th>Location</th>
                {/*<th>Image</th>*/}
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.length > 0 ? (
                destinations.map((dest) => (
                  <tr key={dest.id}>
                    {/*<td>{dest.id}</td>*/}
                    <td>
                      {dest.name}
                      {dest.is_featured && (
                        <FontAwesomeIcon
                          icon={faStar}
                          className="ms-2 text-warning"
                        />
                      )}
                    </td>
                    <td>{dest.location}</td>
                    {/*<td>
                      {dest.image_url && (
                        <img 
                          src={dest.image_url} 
                          alt={dest.name} 
                          style={{ height: '50px', width: 'auto' }}
                          className="img-thumbnail"
                        />
                      )}
                    </td>*/}
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={dest.is_featured || false}
                          readOnly
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditClick(dest)}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteDestination(dest.id)}
                        disabled={loading}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No destinations found. Add your first destination!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DestinationsContent;
