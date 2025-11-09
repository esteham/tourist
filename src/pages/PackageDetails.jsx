import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/Header";

const apiURL = process.env.REACT_APP_API_URL;

function PackageDetails() {
  const { id } = useParams();
  const [packageData, setPackageData] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch package details
        const packageRes = await fetch(
          `${apiURL}/backend/server/admin_crud/get_package_info.php?id=${id}`
        );
        if (!packageRes.ok) throw new Error("Failed to fetch package");
        const packageJson = await packageRes.json();
        if (!packageJson.success)
          throw new Error(packageJson.message || "Package not found");

        // Fetch hotels
        const hotelsRes = await fetch(
          `${apiURL}/backend/server/admin_crud/get_package_hotels.php?package_id=${id}`
        );
        if (!hotelsRes.ok) throw new Error("Failed to fetch hotels");
        const hotelsJson = await hotelsRes.json();

        // Fetch events
        const eventsRes = await fetch(
          `${apiURL}/backend/server/admin_crud/get_package_events.php?package_id=${id}`
        );
        if (!eventsRes.ok) throw new Error("Failed to fetch events");
        const eventsJson = await eventsRes.json();

        setPackageData(packageJson.data);
        setHotels(hotelsJson.success ? hotelsJson.data : []);
        setEvents(eventsJson.success ? eventsJson.data : []);
      } catch (err) {
        setError(err.message);
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error)
    return <div className="text-center py-5 text-danger">Error: {error}</div>;
  if (!packageData)
    return <div className="text-center py-5">Package not found</div>;

  // Destructure with defaults
  const {
    name = "Unknown Package",
    description = "No description available",
    duration = "Not specified",
    price = 0,
    image_url = "package-default.jpg",
    inclusions = "",
    exclusions = "",
    destination_name = "Unknown Destination",
  } = packageData;

  return (
    <div className="container-xxl py-5">
      <div className="container">
        {/* Package Header */}
        <div className="text-center wow fadeInUp">
          <h1 className="mb-4">{name}</h1>
          <div className="d-flex justify-content-center mb-4">
            <span className="me-3">
              <i className="fa fa-calendar-alt text-primary me-2"></i>
              {duration}
            </span>
            <span>
              <i className="fa-solid fa-bangladeshi-taka-sign text-primary me-2">
                {" "}
              </i>
              {Number(price).toFixed(2)}
            </span>

            <span className="ms-3">
              <i className="fa fa-map-marker-alt text-primary me-2"></i>
              {destination_name}
            </span>
          </div>
        </div>

        {/* Package Image */}
        {/*<div className="row mb-5">
          <div className="col-md-8 mx-auto">
            <img 
              src={image_url} 
              alt={name}
              className="img-fluid rounded"
              onError={(e) => {
                e.target.src = 'package-default.jpg';
              }}
            />
          </div>
        </div>*/}

        {/* Package Details */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Package Details</h4>
              </div>
              <div className="card-body">
                <p>{description}</p>

                <h5 className="mt-4">Inclusions</h5>
                <ul>
                  {inclusions ? (
                    inclusions
                      .split(",")
                      .map((item, i) => <li key={i}>{item.trim()}</li>)
                  ) : (
                    <li>No inclusions specified</li>
                  )}
                </ul>

                <h5 className="mt-4">Exclusions</h5>
                <ul>
                  {exclusions ? (
                    exclusions
                      .split(",")
                      .map((item, i) => <li key={i}>{item.trim()}</li>)
                  ) : (
                    <li>No exclusions specified</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            {/* Hotels Section */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Hotel Details</h4>
              </div>
              <div className="card-body">
                {hotels.length > 0 ? (
                  hotels.map((hotel) => (
                    <div key={hotel.id} className="mb-3">
                      <h5>{hotel.hotel_name || "Unnamed Hotel"}</h5>
                      <p className="mb-1">
                        <i className="fa fa-map-marker-alt text-primary me-2"></i>
                        {hotel.hotel_location || "Location not specified"}
                      </p>
                      <p>
                        <i className="fa fa-moon text-primary me-2"></i>
                        {hotel.nights || 1} night(s)
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No hotel information available</p>
                )}
              </div>
            </div>

            {/* Events Section */}
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Events Details (If any)</h4>
              </div>
              <div className="card-body">
                {events.length > 0 ? (
                  <div className="timeline">
                    {events.map((event) => (
                      <div key={event.id} className="timeline-item mb-3">
                        {event.event_date && (
                          <div className="timeline-date">
                            {new Date(event.event_date).toLocaleDateString()}
                          </div>
                        )}
                        <div className="timeline-content">
                          <h5>{event.event_name || "Unnamed Event"}</h5>
                          <p>
                            -{" "}
                            {event.event_description ||
                              "No description available"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No itinerary available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking CTA */}
        <div className="text-center mt-5">
          <a href={`/book/${id}`} className="btn btn-primary btn-lg px-5">
            Book This Package
          </a>
        </div>
      </div>
    </div>
  );
}

export default PackageDetails;
