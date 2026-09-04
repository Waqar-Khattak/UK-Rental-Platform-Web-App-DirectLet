// Property Detail Page - Full property view with actions

import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { AuthContext } from '../context/AuthContext';

const PROPERTY_QUERY = gql`
  query Property($id: ID!) {
    property(id: $id) {
      id
      title
      description
      address
      city
      postcode
      latitude
      longitude
      bedrooms
      bathrooms
      rent
      deposit
      images
      amenities
      availableFrom
      isActive
      viewCount
      landlord {
        id
        firstName
        lastName
        isVerified
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($receiverId: ID!, $content: String!, $propertyId: ID) {
    sendMessage(receiverId: $receiverId, content: $content, propertyId: $propertyId) {
      id
      content
      createdAt
    }
  }
`;

function PropertyDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { loading, error, data } = useQuery(PROPERTY_QUERY, { variables: { id } });
  const [sendMessage] = useMutation(SEND_MESSAGE);

  if (loading) return (
    <div className="loading-screen"><div className="spinner"></div><p>Loading property...</p></div>
  );
  if (error) return <div className="container"><div className="alert alert-danger">Error: {error.message}</div></div>;
  if (!data?.property) return <div className="container"><div className="alert alert-warning">Property not found</div></div>;

  const property = data.property;

  const handleEnquiry = async () => {
    if (!property.landlord) return;
    try {
      await sendMessage({
        variables: {
          receiverId: property.landlord.id,
          content: `Hi, I'm interested in "${property.title}" at ${property.address}. Could you provide more details?`,
          propertyId: property.id,
        },
      });
      alert('Message sent to landlord!');
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  return (
    <div className="container">
      <div className="property-detail-page">
        {/* Image Gallery */}
        <div className="property-gallery">
          {property.images && property.images.length > 0 ? (
            property.images.map((img, idx) => (
              <img key={idx} src={img} alt={`${property.title} - ${idx + 1}`} className="gallery-img" />
            ))
          ) : (
            <div className="gallery-placeholder">
              <span>No images available</span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="property-header">
          <div>
            <h1>{property.title}</h1>
            <p className="property-location">{property.address}, {property.city} {property.postcode}</p>
          </div>
          <div className="property-price-badge">
            <span className="price-amount">£{property.rent}</span>
            <span className="price-period">/month</span>
          </div>
        </div>

        {/* Stats */}
        <div className="property-meta">
          <div className="meta-card">
            <span className="meta-value">{property.bedrooms || 0}</span>
            <span className="meta-label">Bedrooms</span>
          </div>
          <div className="meta-card">
            <span className="meta-value">{property.bathrooms || 0}</span>
            <span className="meta-label">Bathrooms</span>
          </div>
          <div className="meta-card">
            <span className="meta-value">£{property.deposit || 0}</span>
            <span className="meta-label">Deposit</span>
          </div>
          <div className="meta-card">
            <span className="meta-value">{property.viewCount || 0}</span>
            <span className="meta-label">Views</span>
          </div>
        </div>

        {/* Description */}
        <div className="property-section">
          <h2>Description</h2>
          <p>{property.description || 'No description available.'}</p>
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="property-section">
            <h2>Amenities</h2>
            <div className="amenities-grid">
              {property.amenities.map((amenity, idx) => (
                <span key={idx} className="amenity-badge">{amenity}</span>
              ))}
            </div>
          </div>
        )}

        {/* Landlord Info */}
        {property.landlord && (
          <div className="property-section landlord-card">
            <h2>Listed by</h2>
            <div className="landlord-info">
              <div className="landlord-avatar">
                {property.landlord.firstName[0]}{property.landlord.lastName[0]}
              </div>
              <div>
                <p className="landlord-name">{property.landlord.firstName} {property.landlord.lastName}</p>
                {property.landlord.isVerified && <span className="verified-badge">✓ Verified</span>}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {user && user.role === 'tenant' && property.landlord && user.id !== property.landlord.id && (
          <div className="property-actions">
            <Link to={`/schedule-viewing/${property.id}`} className="btn-action btn-primary-action">
              Schedule Viewing
            </Link>
            <button onClick={handleEnquiry} className="btn-action btn-secondary-action">
              Send Enquiry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyDetail;
