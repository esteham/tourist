import React, { useEffect, useState } from "react";
import md5 from "md5";
import OwlCarousel from "react-owl-carousel";
import Swal from "sweetalert2";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import { useNavigate } from "react-router-dom";

const apiURL = process.env.REACT_APP_API_URL;

export default function Home() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packageLoading, setPackageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    rating: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status and get user data
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(
          `${apiURL}/backend/server/check_auth.php`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

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

    checkAuthStatus();
  }, []);

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(
          `${apiURL}/backend/server/getTestimonials.php`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.success) {
          setTestimonials(data.testimonials);
        } else {
          setError(data.message || "Failed to load testimonials");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while fetching testimonials"
        );
        console.error("Error fetching testimonials:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setPackageLoading(true);
        const response = await fetch(
          `${apiURL}/backend/server/admin_crud/get_packages.php`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        if (result.success) {
          // Get first 3 packages
          const firstThreePackages = result.data.slice(0, 3).map((pkg) => ({
            ...pkg,
            price: parseFloat(pkg.price) || 0,
            is_featured: Boolean(pkg.is_featured),
          }));
          setPackages(firstThreePackages);
        } else {
          console.error("Failed to load packages:", result.message);
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
      } finally {
        setPackageLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Get avatar
  const getAvatar = (email) => {
    const hash = email ? md5(email.trim().toLowerCase()) : "";
    return `https://www.gravatar.com/avatar/${hash}?d=retro&s=80`;
  };

  // Stars renderer
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i + 1 <= rating ? "text-warning" : "text-secondary"}
      >
        {i + 1 <= rating ? "★" : "☆"}
      </span>
    ));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setSubmitError("Please login to submit a testimonial");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        `${apiURL}/backend/server/submitTestimonial.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            content: formData.content,
            rating: formData.rating,
          }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        setFormData({ rating: "", content: "" });
        setTestimonials((prev) => [data.testimonial, ...prev]);
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(data.message || "Failed to submit testimonial");
      }
    } catch (err) {
      setSubmitError(err.message || "An error occurred while submitting");
      console.error("Error submitting testimonial:", err);
    } finally {
      setSubmitting(false);
    }
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

  useEffect(() => {
    // Ensure jQuery is available
    if (window.$ && window.$(".testimonial-carousel").owlCarousel) {
      window.$(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
        margin: 30,
        responsive: {
          0: { items: 1 },
          768: { items: 2 },
          992: { items: 3 },
        },
      });
    }
  }, [testimonials]);

  return (
    <div>
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white mb-3 animated slideInDown">
                Enjoy Your Vacation With Us
              </h1>
              <p className="fs-4 text-white mb-4 animated slideInDown">
                Get travel deals & tips delivered to you
              </p>
              <div className="position-relative w-75 mx-auto animated slideInDown">
                <input
                  className="form-control border-0 rounded-pill w-100 py-3 ps-4 pe-5"
                  type="text"
                  placeholder="Eg: Thailand"
                />
                <button
                  type="button"
                  className="btn btn-primary rounded-pill py-2 px-4 position-absolute top-0 end-0 me-2"
                  style={{ marginTop: 7 }}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* About Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div
              className="col-lg-6 wow fadeInUp"
              data-wow-delay="0.1s"
              style={{ minHeight: 400 }}
            >
              <div className="position-relative h-100">
                <img
                  className="img-fluid position-absolute w-100 h-100"
                  src="assets/img/about.jpg"
                  alt=""
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <h6 className="section-title bg-white text-start text-primary pe-3">
                About Us
              </h6>
              <h1 className="mb-4">
                Welcome to <span className="text-primary">TRAVIUQE</span>
              </h1>
              <p className="mb-4">
                We believe travel isn't just about places — it's about stories,
                people, and the moments in between.Discover the world with
                confidence, guided by a team that values comfort, culture, and
                connection.
              </p>
              <p className="mb-4">
                At TRAVIUQE, we believe travel is more than just movement — it’s
                about discovery, connection, and unforgettable moments. From
                romantic getaways to group adventures, we curate experiences
                that are truly yours. Let us take care of the planning, while
                you enjoy the journey. Your dream trip starts right here.
              </p>
              <div className="row gy-2 gx-4 mb-4">
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    First Class Flights
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Handpicked Hotels
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />5 Star
                    Accommodations
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Latest Model Vehicles
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />5
                    Premium City Tours
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    24/7 Service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}
      {/* Service Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Services
            </h6>
            <h1 className="mb-5">Our Services</h1>
          </div>
          <div className="row g-4">
            <div
              className="col-lg-3 col-sm-6 wow fadeInUp"
              data-wow-delay="0.1s"
            >
              <div className="service-item rounded pt-3">
                <div className="p-4">
                  <i className="fa fa-3x fa-globe text-primary mb-4" />
                  <h5 className="fw-bold">WorldWide Tours</h5>
                  <p className="text-muted">
                    Explore breathtaking destinations across the globe with our
                    carefully curated international tour packages.
                  </p>
                </div>
              </div>
            </div>
            <div
              className="col-lg-3 col-sm-6 wow fadeInUp"
              data-wow-delay="0.3s"
            >
              <div className="service-item rounded pt-3">
                <div className="p-4">
                  <i className="fa fa-3x fa-hotel text-primary mb-4" />
                  <h5 className="fw-bold">Hotel Facilities</h5>
                  <p className="text-muted">
                    Enjoy a seamless stay with our exclusive hotel booking
                    services, offering comfort at the best prices.
                  </p>
                </div>
              </div>
            </div>
            <div
              className="col-lg-3 col-sm-6 wow fadeInUp"
              data-wow-delay="0.5s"
            >
              <div className="service-item rounded pt-3">
                <div className="p-4">
                  <i className="fa fa-3x fa-user text-primary mb-4" />
                  <h5 className="fw-bold">Travel Guides</h5>
                  <p className="text-muted">
                    Discover hidden gems and local cultures with our experienced
                    travel guides who make every journey memorable.
                  </p>
                </div>
              </div>
            </div>
            <div
              className="col-lg-3 col-sm-6 wow fadeInUp"
              data-wow-delay="0.7s"
            >
              <div className="service-item rounded pt-3">
                <div className="p-4">
                  <i className="fa fa-3x fa-cog text-primary mb-4" />
                  <h5 className="fw-bold">Scheduled Events</h5>
                  <p className="text-muted">
                    From corporate retreats to private events, we organize
                    everything with precision and creativity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Service End */}
      {/* Destination Start */}
      <div className="container-xxl py-5 destination">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Destination
            </h6>
            <h1 className="mb-5">Popular Destination</h1>
          </div>
          <div className="row g-3">
            <div className="col-lg-7 col-md-6">
              <div className="row g-3">
                <div
                  className="col-lg-12 col-md-12 wow zoomIn"
                  data-wow-delay="0.1s"
                >
                  <a
                    className="position-relative d-block overflow-hidden"
                    href=""
                  >
                    <img
                      className="img-fluid"
                      src="assets/img/destination-1.jpg"
                      alt=""
                    />
                    <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                      30% OFF
                    </div>
                    <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                      Thailand
                    </div>
                  </a>
                </div>
                <div
                  className="col-lg-6 col-md-12 wow zoomIn"
                  data-wow-delay="0.3s"
                >
                  <a
                    className="position-relative d-block overflow-hidden"
                    href=""
                  >
                    <img
                      className="img-fluid"
                      src="assets/img/destination-2.jpg"
                      alt=""
                    />
                    <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                      25% OFF
                    </div>
                    <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                      Malaysia
                    </div>
                  </a>
                </div>
                <div
                  className="col-lg-6 col-md-12 wow zoomIn"
                  data-wow-delay="0.5s"
                >
                  <a
                    className="position-relative d-block overflow-hidden"
                    href=""
                  >
                    <img
                      className="img-fluid"
                      src="assets/img/destination-3.jpg"
                      alt=""
                    />
                    <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                      35% OFF
                    </div>
                    <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                      Australia
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div
              className="col-lg-5 col-md-6 wow zoomIn"
              data-wow-delay="0.7s"
              style={{ minHeight: 350 }}
            >
              <a
                className="position-relative d-block h-100 overflow-hidden"
                href=""
              >
                <img
                  className="img-fluid position-absolute w-100 h-100"
                  src="assets/img/destination-4.jpg"
                  alt=""
                  style={{ objectFit: "cover" }}
                />
                <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                  20% OFF
                </div>
                <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                  Indonesia
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Destination Start */}
      {/* Package Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Packages
            </h6>
            <h1 className="mb-5">Awesome Packages</h1>
          </div>

          {packageLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading packages...</p>
            </div>
          ) : (
            <>
              <div className="row g-4 justify-content-center">
                {packages.length > 0 ? (
                  packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="col-lg-4 col-md-6 wow fadeInUp"
                      data-wow-delay="0.1s"
                    >
                      <div className="package-item">
                        <div className="overflow-hidden">
                          <img
                            className="img-fluid"
                            src={`/assets/img/${pkg.image_url}`}
                            alt={pkg.name}
                            onError={(e) => {
                              e.target.src = "/assets/img/package-default.jpg";
                            }}
                          />
                        </div>
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
                          <h3 className="mb-0">
                            ৳ {Number(pkg.price).toFixed(2)}
                          </h3>
                          <div className="mb-3">
                            {[...Array(5)].map((_, i) => (
                              <small
                                key={i}
                                className="fa fa-star text-primary"
                              />
                            ))}
                          </div>
                          <ul className="text-start ps-4">
                            {pkg.inclusions ? (
                              pkg.inclusions.split(",").map((item, index) => (
                                <li key={index} className="text-muted">
                                  {item.trim()}
                                </li>
                              ))
                            ) : (
                              <li className="text-muted">
                                No inclusions listed.
                              </li>
                            )}
                          </ul>
                          <div className="d-flex justify-content-center mb-2">
                            <button
                              onClick={() => navigate("/packages")}
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
                    <h4>No packages available at the moment</h4>
                    <p>Please check back later</p>
                  </div>
                )}
              </div>

              {/* Show All Packages Link */}
              <div className="text-end mt-5">
                <span
                  className="fw-semibold text-primary"
                  style={{
                    cursor: "pointer",
                    fontSize: "1rem",
                    position: "relative",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.textDecoration = "underline")
                  }
                  onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                  onClick={() => navigate("/packages")}
                >
                  View All Packages
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Package End */}
      {/* Process Start */}
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
      {/* Process Start */}
      {/* Team Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Travel Guide
            </h6>
            <h1 className="mb-5">Meet Our Guide</h1>
          </div>
          <div className="row g-4">
            <div
              className="col-lg-3 col-md-6 wow fadeInUp"
              data-wow-delay="0.1s"
            >
              <div className="team-item">
                <div className="overflow-hidden">
                  <img
                    className="img-fluid"
                    src="assets/img/team-1.jpg"
                    alt=""
                  />
                </div>
                <div
                  className="position-relative d-flex justify-content-center"
                  style={{ marginTop: "-19px" }}
                >
                  <a
                    className="btn btn-square mx-1"
                    href="https://www.facebook.com/mdripon.hossain.9843"
                  >
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a className="btn btn-square mx-1" href="">
                    <i className="fab fa-twitter" />
                  </a>
                  <a className="btn btn-square mx-1" href="">
                    <i className="fab fa-instagram" />
                  </a>
                </div>
                <div className="text-center p-4">
                  <h5 className="mb-0">MD Ripon Hossain</h5>
                  <small>Sr. Guide</small>
                </div>
              </div>
            </div>
            <div
              className="col-lg-3 col-md-6 wow fadeInUp"
              data-wow-delay="0.3s"
            >
              <div className="team-item">
                <div className="overflow-hidden">
                  <img
                    className="img-fluid"
                    src="assets/img/team-2.jpg"
                    alt=""
                  />
                </div>
                <div
                  className="position-relative d-flex justify-content-center"
                  style={{ marginTop: "-19px" }}
                >
                  <a className="btn btn-square mx-1" href="">
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a className="btn btn-square mx-1" href="">
                    <i className="fab fa-twitter" />
                  </a>
                  <a className="btn btn-square mx-1" href="">
                    <i className="fab fa-instagram" />
                  </a>
                </div>
                <div className="text-center p-4">
                  <h5 className="mb-0">Abdul Akher Khondokar</h5>
                  <small>Sr. Guide</small>
                </div>
              </div>
            </div>
            <div
              className="col-lg-3 col-md-6 wow fadeInUp"
              data-wow-delay="0.5s"
            >
              <div className="team-item">
                <div className="overflow-hidden">
                  <img
                    className="img-fluid"
                    src="assets/img/team-3.jpg"
                    alt=""
                  />
                </div>
                <div
                  className="position-relative d-flex justify-content-center"
                  style={{ marginTop: "-19px" }}
                >
                  <a
                    className="btn btn-square mx-1"
                    href="https://www.facebook.com/esteham"
                  >
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a className="btn btn-square mx-1" href="">
                    <i className="fab fa-twitter" />
                  </a>
                  <a className="btn btn-square mx-1" href="">
                    <i className="fab fa-instagram" />
                  </a>
                </div>
                <div className="text-center p-4">
                  <h5 className="mb-0">Eshtehamul Hasan</h5>
                  <small>Sr. Guide</small>
                </div>
              </div>
            </div>
            <div
              className="col-lg-3 col-md-6 wow fadeInUp"
              data-wow-delay="0.7s"
            >
              <div className="team-item">
                <div className="overflow-hidden">
                  <img
                    className="img-fluid"
                    src="assets/img/team-4.jpg"
                    alt=""
                  />
                </div>
                <div
                  className="position-relative d-flex justify-content-center"
                  style={{ marginTop: "-19px" }}
                >
                  <a className="btn btn-square mx-1" href="">
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a className="btn btn-square mx-1" href="">
                    <i className="fab fa-twitter" />
                  </a>
                  <a className="btn btn-square mx-1" href="">
                    <i className="fab fa-instagram" />
                  </a>
                </div>
                <div className="text-center p-4">
                  <h5 className="mb-0">Rejaul karim</h5>
                  <small>Sr. Guide</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Team End */}
      {/* Testimonial Start */}
      <div className="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container">
          <div className="text-center">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Testimonial
            </h6>
            <h1 className="mb-5">Our Clients Say!!!</h1>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading testimonials...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center">{error}</div>
          ) : testimonials.length > 0 ? (
            <OwlCarousel
              className="owl-theme testimonial-carousel"
              loop
              margin={30}
              autoplay
              smartSpeed={1000}
              dots={false}
              responsive={{
                0: { items: 1 },
                768: { items: 2 },
                992: { items: 3 },
              }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="testimonial-item bg-white text-center border p-4"
                >
                  {/*<img
                    className="bg-white rounded-circle shadow p-1 mx-auto mb-3"
                    src={getAvatar(testimonial.email)}
                    style={{ width: 80, height: 80 }}
                    alt={testimonial.username}
                  />*/}
                  <h5 className="mb-1">{testimonial.username}</h5>
                  <div className="mb-2">{renderStars(testimonial.rating)}</div>
                  <p className="mb-0">{testimonial.content}</p>
                  <small className="text-muted d-block mt-2">
                    {new Date(testimonial.created_at).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </OwlCarousel>
          ) : (
            <div className="text-center py-5">
              <p>
                No testimonials available yet. Be the first to share your
                experience!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="container-xxl py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="card border-0 shadow-lg rounded-4">
                {/* Card Header */}
                <div className="card-header bg-white border-0 py-3 text-center">
                  <h5 className="card-title mb-0 fw-bold text-primary">
                    <i className="fa fa-star me-2"></i>
                    Share Your Experience
                  </h5>
                </div>

                <div className="card-body p-4">
                  {!isAuthenticated ? (
                    <div className="text-center py-4">
                      <i className="fa fa-user-lock fa-2x text-primary mb-3"></i>
                      <h6 className="fw-semibold mb-2">Login Required</h6>
                      <p className="text-muted mb-3 small">
                        Please login to share your valuable feedback with us.
                      </p>
                      <a
                        href="/login"
                        className="btn btn-outline-primary btn-sm px-3"
                      >
                        <i className="fa fa-sign-in-alt me-1"></i>
                        Login
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {/* Success Alert */}
                      {submitSuccess && (
                        <div
                          className="alert alert-success alert-dismissible fade show mb-3 rounded-3"
                          role="alert"
                        >
                          <i className="fa fa-check-circle me-2"></i>
                          Thank you for your feedback!
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="alert"
                          ></button>
                        </div>
                      )}

                      {/* Error Alert */}
                      {submitError && (
                        <div
                          className="alert alert-danger alert-dismissible fade show mb-3 rounded-3"
                          role="alert"
                        >
                          <i className="fa fa-exclamation-circle me-2"></i>
                          {submitError}
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="alert"
                          ></button>
                        </div>
                      )}

                      {/* Rating Input */}
                      <div className="mb-3">
                        {/*<label className="form-label fw-semibold">Your Rating</label>*/}
                        <select
                          className="form-select shadow-sm"
                          id="rating"
                          name="rating"
                          value={formData.rating}
                          onChange={handleInputChange}
                          required
                        >
                          <option className="text-muted" value="">
                            Select rating...
                          </option>
                          <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                          <option value="4">⭐⭐⭐⭐ Very Good</option>
                          <option value="3">⭐⭐⭐ Good</option>
                          <option value="2">⭐⭐ Fair</option>
                          <option value="1">⭐ Poor</option>
                        </select>
                      </div>

                      {/* Testimonial Textarea */}
                      <div className="mb-3">
                        {/*<label className="form-label fw-semibold">
                                          Your Experience
                                        </label>*/}
                        <textarea
                          className="form-control shadow-sm"
                          id="content"
                          name="content"
                          rows="4"
                          placeholder="Write about your journey with us..."
                          value={formData.content}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>

                      {/* Submit Button */}
                      <div className="d-grid mt-3">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg rounded-3 shadow-sm"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className="fa fa-paper-plane me-2"></i>
                              Submit Feedback
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center mt-3">
                <small className="text-muted">
                  <i className="fa fa-info-circle me-1"></i>
                  Your feedback helps us improve our services
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial End */}
    </div>
  );
}
