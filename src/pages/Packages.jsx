import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import "./Packages.css";

const apiURL = process.env.REACT_APP_API_URL;

function Packages() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [durationFilter, setDurationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    checkAuthStatus();
    fetchPackages();
  }, []);

  useEffect(() => {
    filterAndSortPackages();
  }, [packages, searchTerm, priceRange, durationFilter, sortBy]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${apiURL}/backend/server/check_auth.php`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Auth check failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.authenticated && result.user) {
        setIsAuthenticated(true);
        setUser(result.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${apiURL}/backend/server/admin_crud/get_packages.php`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to load packages");
      }

      const packagesData = result.data.map((pkg) => ({
        ...pkg,
        price: parseFloat(pkg.price) || 0,
        is_featured: Boolean(pkg.is_featured),
        hotels: pkg.hotels || [],
        events: pkg.events || [],
      }));

      setPackages(packagesData);
      setFilteredPackages(packagesData);

      // Set initial price range based on actual data
      const prices = packagesData.map((p) => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange([minPrice, maxPrice]);
    } catch (err) {
      console.error("Error fetching packages:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPackages = () => {
    let filtered = [...packages];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (pkg.description &&
            pkg.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (pkg.destination_name &&
            pkg.destination_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Price filter
    filtered = filtered.filter(
      (pkg) => pkg.price >= priceRange[0] && pkg.price <= priceRange[1]
    );

    // Duration filter
    if (durationFilter !== "all") {
      filtered = filtered.filter((pkg) => {
        const durationDays = parseInt(pkg.duration) || 0;
        switch (durationFilter) {
          case "short":
            return durationDays <= 3;
          case "medium":
            return durationDays > 3 && durationDays <= 7;
          case "long":
            return durationDays > 7;
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "duration":
          return (parseInt(a.duration) || 0) - (parseInt(b.duration) || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredPackages(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePriceRangeChange = (min, max) => {
    setPriceRange([min, max]);
  };

  const handleDurationFilterChange = (duration) => {
    setDurationFilter(duration);
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
  };

  const resetFilters = () => {
    setSearchTerm("");
    const prices = packages.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    setPriceRange([minPrice, maxPrice]);
    setDurationFilter("all");
    setSortBy("name");
  };

  const handleShowModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPackage(null);
  };

  const handleBookNow = (pkg) => {
    if (isAuthenticated) {
      navigate("/booking", { state: { packageId: pkg.id } });
    } else {
      Swal.fire({
        title: "Login Required",
        text: "You need to login first to book packages",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login", { state: { from: "/packages" } });
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading packages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        <h4>Error loading packages</h4>
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const maxPriceValue = Math.max(...packages.map((p) => p.price));
  const minPriceValue = Math.min(...packages.map((p) => p.price));

  return (
    <div className="packages-page">
      {/* Hero Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Packages
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center">
                  <li className="breadcrumb-item">
                    <a href="/">Home</a>
                  </li>
                  <li
                    className="breadcrumb-item text-white active"
                    aria-current="page"
                  >
                    Packages
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container-xxl py-3 bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Search Input */}
            <div className="col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                  <i className="fa fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title">
                    Price Range: ৳{priceRange[0].toLocaleString()} - ৳
                    {priceRange[1].toLocaleString()}
                  </h6>
                  <input
                    type="range"
                    className="form-range"
                    min={minPriceValue}
                    max={maxPriceValue}
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      handlePriceRangeChange(
                        priceRange[0],
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <div className="d-flex justify-content-between">
                    <small>৳{minPriceValue.toLocaleString()}</small>
                    <small>৳{maxPriceValue.toLocaleString()}</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Filter */}
            <div className="col-lg-2">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title">Duration</h6>
                  <select
                    className="form-select form-select-sm"
                    value={durationFilter}
                    onChange={(e) => handleDurationFilterChange(e.target.value)}
                  >
                    <option value="all">All Durations</option>
                    <option value="short">Short (1-3 days)</option>
                    <option value="medium">Medium (4-7 days)</option>
                    <option value="long">Long (8+ days)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="col-lg-2">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title">Sort By</h6>
                  <select
                    className="form-select form-select-sm"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="row mt-3">
            <div className="col-12 text-center">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={resetFilters}
              >
                <i className="fa fa-refresh me-1"></i>
                Reset Filters
              </button>
              <small className="text-muted ms-3">
                Showing {filteredPackages.length} of {packages.length} packages
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Packages
            </h6>
            <h1 className="mb-5">Awesome Packages</h1>
          </div>
          <div className="row g-4 justify-content-center">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="col-lg-4 col-md-6 wow fadeInUp"
                  data-wow-delay="0.1s"
                >
                  <div className="package-item">
                    <img
                      src={`/assets/img/${pkg.image_url}`}
                      alt={pkg.name}
                      className="package-image"
                      onError={(e) => {
                        e.target.src = "/assets/img/package-default.jpg";
                      }}
                    />
                    <div className="d-flex border-bottom">
                      <small className="flex-fill text-center border-end py-2">
                        <i className="fa fa-map-marker-alt text-primary me-2" />
                        {pkg.name || "Unknown Destination"}
                      </small>
                      <small className="flex-fill text-center border-end py-2">
                        <i className="fa fa-calendar-alt text-primary me-2" />
                        {pkg.duration || "N/A"}
                      </small>
                      <small className="flex-fill text-center py-2">
                        <i className="fa fa-user text-primary me-2" />
                        {pkg.package_count || 1} Person
                      </small>
                    </div>
                    <div className="text-center p-4">
                      <h3 className="mb-0">৳ {Number(pkg.price).toFixed(2)}</h3>
                      <div className="mb-3">
                        {[...Array(5)].map((_, i) => (
                          <small key={i} className="fa fa-star text-primary" />
                        ))}
                      </div>
                      <ul className="text-start ps-4">
                        {pkg.inclusions ? (
                          pkg.inclusions
                            .split(",")
                            .slice(0, 3)
                            .map((item, index) => (
                              <li key={index} className="text-muted">
                                {item.trim()}
                              </li>
                            ))
                        ) : (
                          <li className="text-muted">No inclusions listed.</li>
                        )}
                        {pkg.inclusions &&
                          pkg.inclusions.split(",").length > 3 && (
                            <li className="text-muted">
                              +{pkg.inclusions.split(",").length - 3} more
                            </li>
                          )}
                      </ul>
                      <div className="d-flex justify-content-center mb-2">
                        <button
                          onClick={() => handleShowModal(pkg)}
                          className="btn btn-sm btn-primary px-3 border-end"
                          style={{ borderRadius: "30px 0 0 30px" }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleBookNow(pkg)}
                          className="btn btn-sm btn-primary px-3"
                          style={{ borderRadius: "0 30px 30px 0" }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i className="fa fa-search fa-3x text-muted mb-3"></i>
                <h4>No packages found</h4>
                <p className="text-muted">Try adjusting your search filters</p>
                <button className="btn btn-primary" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Package Details Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        className="package-modal"
      >
        <Modal.Body className="p-4">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary mb-2">
              {selectedPackage?.name || "Package Details"}
            </h3>
          </div>

          <div
            className="position-relative mb-4 rounded overflow-hidden"
            style={{ height: "400px" }}
          >
            <img
              src={`/assets/img/${selectedPackage?.image_url}`}
              alt={selectedPackage?.name}
              className="w-100 h-100 object-cover"
              onError={(e) => {
                e.target.src = "/assets/img/package-default.jpg";
              }}
            />

            {selectedPackage?.destination_name && (
              <div className="position-absolute bottom-0 start-0 m-2">
                <span className="badge bg-dark bg-opacity-75 d-flex align-items-center">
                  <i className="fa fa-map-marker-alt me-1"></i>
                  {selectedPackage.destination_name}
                </span>
              </div>
            )}

            {selectedPackage?.duration && (
              <div className="position-absolute bottom-0 end-0 m-2">
                <span className="badge bg-dark bg-opacity-75 d-flex align-items-center">
                  <i className="fa fa-clock me-1"></i>
                  {selectedPackage.duration}
                </span>
              </div>
            )}
          </div>

          <div className="text-center mb-4">
            <h4 className="text-primary d-inline-block me-3">
              ৳ {Number(selectedPackage?.price || 0).toFixed(2)}
            </h4>
            <div className="d-inline-block text-warning">
              {[...Array(5)].map((_, i) => (
                <i key={i} className="fas fa-star"></i>
              ))}
            </div>
          </div>

          {selectedPackage?.description && (
            <div className="mb-4 p-3 bg-light rounded text-center">
              <p className="mb-0">{selectedPackage.description}</p>
            </div>
          )}

          <div className="row">
            <div className="col-md-6">
              <div className="card mb-3 border-0 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fa fa-check-circle me-2"></i>
                    What's Included
                  </h5>
                </div>
                <div className="card-body">
                  {selectedPackage?.inclusions ? (
                    <ul className="list-unstyled">
                      {selectedPackage.inclusions.split(",").map((item, i) => (
                        <li key={i} className="mb-2">
                          <i className="fa fa-check text-primary me-2"></i>
                          {item.trim()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No inclusions specified</p>
                  )}
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fa fa-times-circle me-2"></i>
                    What's Not Included
                  </h5>
                </div>
                <div className="card-body">
                  {selectedPackage?.exclusions ? (
                    <ul className="list-unstyled">
                      {selectedPackage.exclusions.split(",").map((item, i) => (
                        <li key={i} className="mb-2">
                          <i className="fa fa-times text-danger me-2"></i>
                          {item.trim()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No exclusions specified</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              {selectedPackage?.hotels?.length > 0 && (
                <div className="card mb-3 border-0 shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="fa fa-hotel me-2"></i>
                      Accommodation
                    </h5>
                  </div>
                  <div className="card-body">
                    {selectedPackage.hotels.map((hotel, index) => (
                      <div key={index} className="mb-3">
                        <h6 className="d-flex align-items-center text-primary">
                          <i className="fa fa-hotel me-2"></i>
                          {hotel.hotel_name || "Hotel"}
                        </h6>
                        {hotel.hotel_location && (
                          <p className="small mb-1">
                            <i className="fa fa-map-marker-alt text-muted me-1"></i>
                            {hotel.hotel_location}
                          </p>
                        )}
                        {hotel.nights && (
                          <p className="small mb-0">
                            <i className="fa fa-moon text-muted me-1"></i>
                            {hotel.nights} night stay
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPackage?.events?.filter(
                (e) => e.event_name || e.event_description || e.event_date
              ).length > 0 && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="fa fa-calendar-alt me-2"></i>
                      Itinerary Highlights
                    </h5>
                  </div>
                  <div className="card-body">
                    {selectedPackage.events
                      .filter(
                        (event) =>
                          event.event_name ||
                          event.event_description ||
                          event.event_date
                      )
                      .map((event, index) => (
                        <div key={index} className="mb-3">
                          {event.event_name && (
                            <h6 className="d-flex align-items-center">
                              <i className="fa fa-calendar-day text-primary me-2"></i>
                              {event.event_name}
                            </h6>
                          )}
                          {event.event_description && (
                            <p className="small mb-0">
                              <i className="fa fa-info-circle text-muted me-1"></i>
                              {event.event_description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <button
            onClick={handleCloseModal}
            className="btn btn-outline-secondary me-2 px-4"
          >
            Close
          </button>
          <button
            onClick={() => selectedPackage && handleBookNow(selectedPackage)}
            className="btn btn-primary px-4"
          >
            <i className="fa fa-calendar-check me-2"></i>
            Book Now
          </button>
        </Modal.Footer>
      </Modal>

      {/* Process Section */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center pb-4 wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Process
            </h6>
            <h1 className="mb-5">3 Easy Steps</h1>
          </div>
          <div className="row gy-5 gx-4 justify-content-center">
            <div
              className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp"
              data-wow-delay="0.1s"
            >
              <div className="position-relative border border-primary pt-5 pb-4 px-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                  style={{ width: 100, height: 100 }}
                >
                  <i className="fa fa-globe fa-3x text-white" />
                </div>
                <h5 className="mt-4">Choose Packages</h5>
                <hr className="w-25 mx-auto bg-primary mb-1" />
                <hr className="w-50 mx-auto bg-primary mt-0" />
                <p className="mb-0">
                  Select from our wide range of travel packages.
                </p>
              </div>
            </div>
            <div
              className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp"
              data-wow-delay="0.3s"
            >
              <div className="position-relative border border-primary pt-5 pb-4 px-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                  style={{ width: 100, height: 100 }}
                >
                  <i className="fa fa-dollar-sign fa-3x text-white" />
                </div>
                <h5 className="mt-4">Make Payment</h5>
                <hr className="w-25 mx-auto bg-primary mb-1" />
                <hr className="w-50 mx-auto bg-primary mt-0" />
                <p className="mb-0">
                  Complete your booking with secure payment.
                </p>
              </div>
            </div>
            <div
              className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp"
              data-wow-delay="0.5s"
            >
              <div className="position-relative border border-primary pt-5 pb-4 px-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                  style={{ width: 100, height: 100 }}
                >
                  <i className="fa fa-check-circle fa-3x text-white" />
                </div>
                <h5 className="mt-4">Confirmation</h5>
                <hr className="w-25 mx-auto bg-primary mb-1" />
                <hr className="w-50 mx-auto bg-primary mt-0" />
                <p className="mb-0">
                  Receive your booking confirmation instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Packages;
