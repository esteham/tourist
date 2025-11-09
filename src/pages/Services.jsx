import React, { useEffect, useState } from "react";
import md5 from "md5";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";

const apiURL = process.env.REACT_APP_API_URL;

function Services() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div>
      {/* Hero Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Services
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
                    Services
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

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

      {/* Testimonials Section */}
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

export default Services;
