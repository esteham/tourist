import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faPhoneAlt, 
  faEnvelope,
  faCheckCircle,
  faTimesCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

const apiURL = process.env.REACT_APP_API_URL;

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch company information from database
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch(`${apiURL}/backend/server/about.php`);
        const data = await response.json();
        
        if (data.success) {
          setCompanyInfo(data.data);
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch(`${apiURL}/backend/server/contact.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-xxl py-5">
        <div className="container text-center">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Contact Us
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center">
                  <li className="breadcrumb-item">
                    <a href="/">Home</a>
                  </li>
                  <li className="breadcrumb-item text-white active" aria-current="page">
                    Contact
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Contact Us
            </h6>
            <h1 className="mb-5">Contact For Any Query</h1>
          </div>
          
          {submitStatus === 'success' && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Thank you for your message! We'll get back to you soon.
              <button type="button" className="btn-close" onClick={() => setSubmitStatus(null)}></button>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
              Sorry, there was an error sending your message. Please try again.
              <button type="button" className="btn-close" onClick={() => setSubmitStatus(null)}></button>
            </div>
          )}

          <div className="row g-4">
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
              <h5>Get In Touch</h5>
              <p className="mb-4">
                {companyInfo?.about_text || 'Have questions about our travel packages? Need assistance with your booking? Our team is here to help you plan your perfect getaway.'}
              </p>
              
              <div className="d-flex align-items-center mb-4">
                <div className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary" style={{ width: 50, height: 50 }}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white" />
                </div>
                <div className="ms-3">
                  <h5 className="text-primary">Office</h5>
                  <p className="mb-0">{companyInfo?.address || 'Chasara, Narayanganj, Bangladesh'}</p>
                </div>
              </div>
              
              <div className="d-flex align-items-center mb-4">
                <div className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary" style={{ width: 50, height: 50 }}>
                  <FontAwesomeIcon icon={faPhoneAlt} className="text-white" />
                </div>
                <div className="ms-3">
                  <h5 className="text-primary">Mobile</h5>
                  <p className="mb-0">{companyInfo?.phone || '+8801949854504'}</p>
                </div>
              </div>
              
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary" style={{ width: 50, height: 50 }}>
                  <FontAwesomeIcon icon={faEnvelope} className="text-white" />
                </div>
                <div className="ms-3">
                  <h5 className="text-primary">Email</h5>
                  <p className="mb-0">{companyInfo?.email || 'shimzo@gmail.com'}</p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
              <iframe
                className="position-relative rounded w-100 h-100"
                src={companyInfo?.map_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.3907433308436!2d90.49672352438745!3d23.62617364353597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b10f2e4b60f5%3A0x87beeecd7f88883!2sChashara%2C%20Narayanganj!5e0!3m2!1sen!2sbd!4v1754198583266!5m2!1sen!2sbd'}
                frameBorder={0}
                style={{ minHeight: 300, border: 0 }}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex={0}
                title="Office Location"
              />
            </div>
            
            <div className="col-lg-4 col-md-12 wow fadeInUp" data-wow-delay="0.5s">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        id="name"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="name">Your Name</label>
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="email">Your Email</label>
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="form-floating">
                      <input
                        type="text"
                        className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                        id="subject"
                        name="subject"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="subject">Subject</label>
                      {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="form-floating">
                      <textarea
                        className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                        placeholder="Leave a message here"
                        id="message"
                        name="message"
                        style={{ height: 100 }}
                        value={formData.message}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="message">Message</label>
                      {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <button 
                      className="btn btn-primary w-100 py-3" 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Contact End */}
    </div>
  );
}

export default Contact;