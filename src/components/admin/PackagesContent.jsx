import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const apiURL = process.env.REACT_APP_API_URL;

const PackagesContent = ({
  packages,
  destinations,
  showAddForm,
  setShowAddForm,
  editFormData,
  setEditFormData,
  isEditing,
  setIsEditing,
  handleEditSubmit,
  handleDeletePackage,
  handleAddPackage,
}) => {
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleHotelChange = (index, field, value) => {
    const updatedHotels = [...editFormData.hotels];
    updatedHotels[index][field] =
      field === "nights" ? parseInt(value) || 1 : value;
    setEditFormData({
      ...editFormData,
      hotels: updatedHotels,
    });
  };

  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...editFormData.events];
    updatedEvents[index][field] = value;
    setEditFormData({
      ...editFormData,
      events: updatedEvents,
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image to server
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/upload_package_image.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      setEditFormData({
        ...editFormData,
        image_url: data.fileName,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = {};
    if (!editFormData.name.trim()) errors.name = "Name is required";
    if (!editFormData.destination_id)
      errors.destination_id = "Destination is required";
    if (!editFormData.duration.trim()) errors.duration = "Duration is required";
    if (!editFormData.price) errors.price = "Price is required";

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      if (isEditing) {
        await handleEditSubmit(isEditing, editFormData);
      } else {
        await handleAddPackage(editFormData);
      }
      setShowAddForm(false);
      setImagePreview(null);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error: " + (error.message || "Failed to save package"));
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Package Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) {
              setEditFormData({
                name: "",
                destination_id: "",
                duration: "",
                price: "",
                inclusions: "",
                exclusions: "",
                is_featured: false,
                image_url: "package-default.jpg",
                hotels: [{ hotel_name: "", hotel_location: "", nights: 1 }],
                events: [
                  { event_name: "", event_description: "", event_date: "" },
                ],
              });
              setImagePreview(null);
              setIsEditing(null);
            }
          }}
        >
          <FontAwesomeIcon
            icon={showAddForm ? faTimes : faPlus}
            className="me-2"
          />
          {showAddForm ? "Cancel" : "Add New Package"}
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>{isEditing ? "Edit Package" : "Add New Package"}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Package Name*</label>
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
                  <label className="form-label">Destination*</label>
                  <select
                    className={`form-select ${
                      formErrors.destination_id && "is-invalid"
                    }`}
                    name="destination_id"
                    value={editFormData.destination_id}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Destination</option>
                    {destinations.map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.destination_id && (
                    <div className="invalid-feedback">
                      {formErrors.destination_id}
                    </div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Duration*</label>
                  <input
                    type="text"
                    className={`form-control ${
                      formErrors.duration && "is-invalid"
                    }`}
                    name="duration"
                    value={editFormData.duration}
                    onChange={handleFormChange}
                  />
                  {formErrors.duration && (
                    <div className="invalid-feedback">
                      {formErrors.duration}
                    </div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Price*</label>
                  <input
                    type="number"
                    className={`form-control ${
                      formErrors.price && "is-invalid"
                    }`}
                    name="price"
                    value={editFormData.price}
                    onChange={handleFormChange}
                  />
                  {formErrors.price && (
                    <div className="invalid-feedback">{formErrors.price}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Featured</label>
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="is_featured"
                      checked={editFormData.is_featured || false}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Inclusions</label>
                  <textarea
                    className="form-control"
                    name="inclusions"
                    value={editFormData.inclusions || ""}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="What's included in the package..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Exclusions</label>
                  <textarea
                    className="form-control"
                    name="exclusions"
                    value={editFormData.exclusions || ""}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="What's not included in the package..."
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Package Image</label>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{
                          width: "150px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    ) : editFormData.image_url ? (
                      <img
                        src={`${apiURL}/client/public/assets/img/${editFormData.image_url}`}
                        alt="No Image"
                        className="img-thumbnail"
                        style={{
                          width: "150px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="img-thumbnail d-flex align-items-center justify-content-center"
                        style={{
                          width: "150px",
                          height: "100px",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <div className="text-muted mt-1">Uploading image...</div>
                    )}
                    <small className="text-muted">
                      Recommended size: 800x600px
                    </small>
                  </div>
                </div>
              </div>

              <div className="card mb-3">
                <div className="card-header">Hotel Facilities</div>
                <div className="card-body">
                  {editFormData.hotels.map((hotel, index) => (
                    <div className="row mb-3" key={index}>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Hotel Name"
                          value={hotel.hotel_name}
                          onChange={(e) =>
                            handleHotelChange(
                              index,
                              "hotel_name",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Location"
                          value={hotel.hotel_location}
                          onChange={(e) =>
                            handleHotelChange(
                              index,
                              "hotel_location",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-2">
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          placeholder="Nights"
                          value={hotel.nights}
                          onChange={(e) =>
                            handleHotelChange(index, "nights", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-2">
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            const updated = editFormData.hotels.filter(
                              (_, i) => i !== index
                            );
                            setEditFormData({
                              ...editFormData,
                              hotels: updated,
                            });
                          }}
                          disabled={editFormData.hotels.length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setEditFormData({
                        ...editFormData,
                        hotels: [
                          ...editFormData.hotels,
                          { hotel_name: "", hotel_location: "", nights: 1 },
                        ],
                      });
                    }}
                  >
                    Add Hotel
                  </button>
                </div>
              </div>

              <div className="card mb-3">
                <div className="card-header">Event Facilities</div>
                <div className="card-body">
                  {editFormData.events.map((event, index) => (
                    <div className="row mb-3" key={index}>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Event Name"
                          value={event.event_name}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "event_name",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Description"
                          value={event.event_description}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "event_description",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="date"
                          className="form-control"
                          value={event.event_date}
                          onChange={(e) =>
                            handleEventChange(
                              index,
                              "event_date",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-2">
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            const updated = editFormData.events.filter(
                              (_, i) => i !== index
                            );
                            setEditFormData({
                              ...editFormData,
                              events: updated,
                            });
                          }}
                          disabled={editFormData.events.length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setEditFormData({
                        ...editFormData,
                        events: [
                          ...editFormData.events,
                          {
                            event_name: "",
                            event_description: "",
                            event_date: "",
                          },
                        ],
                      });
                    }}
                  >
                    Add Event
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={() => {
                    setShowAddForm(false);
                    setIsEditing(null);
                    setImagePreview(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadingImage}
                >
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {isEditing ? "Update Package" : "Save Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Image</th>
              <th>Package Name</th>
              <th>Destination</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>
                  <img
                    src={`${apiURL}/client/public/assets/img/${
                      pkg.image_url || "package-default.jpg"
                    }`}
                    alt={pkg.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{pkg.name}</td>
                <td>
                  {destinations.find((d) => d.id === pkg.destination_id)
                    ?.name || "N/A"}
                </td>
                <td>{pkg.duration}</td>
                <td>৳ {pkg.price}</td>
                <td>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={pkg.is_featured || false}
                      readOnly
                    />
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => {
                      setEditFormData({
                        id: pkg.id,
                        name: pkg.name,
                        destination_id: pkg.destination_id,
                        duration: pkg.duration,
                        price: pkg.price,
                        inclusions: pkg.inclusions || "",
                        exclusions: pkg.exclusions || "",
                        is_featured: pkg.is_featured || false,
                        image_url: pkg.image_url || "package-default.jpg",
                        hotels: pkg.hotel_name
                          ? [
                              {
                                hotel_name: pkg.hotel_name,
                                hotel_location: pkg.hotel_location || "",
                                nights: pkg.nights || 1,
                              },
                            ]
                          : [{ hotel_name: "", hotel_location: "", nights: 1 }],
                        events: pkg.event_name
                          ? [
                              {
                                event_name: pkg.event_name,
                                event_description: pkg.event_description || "",
                                event_date: pkg.event_date || "",
                              },
                            ]
                          : [
                              {
                                event_name: "",
                                event_description: "",
                                event_date: "",
                              },
                            ],
                      });
                      setImagePreview(null);
                      setShowAddForm(true);
                      setIsEditing(pkg.id);
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeletePackage(pkg.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PackagesContent;
