// Property Card Component - Reusable property display card

import React from 'react';
import { Link } from 'react-router-dom';

function PropertyCard({ property }) {
  return (
    <Link to={`/property/${property.id}`} className="text-decoration-none">
      <div className="property-card">
        <img
          src={property.images?.[0] || `https://picsum.photos/seed/${property.id}/800/500`}
          alt={property.title}
          loading="lazy"
        />
        <div className="p-4">
          <h3>{property.title}</h3>
          <p className="text-muted">{property.city}</p>
          <p className="price">£{property.rent}/month</p>
          <p className="details">
            {property.bedrooms || 0} bed · {property.bathrooms || 0} bath
          </p>
          {property.description && (
            <p className="text-secondary">
              {property.description.slice(0, 90)}{property.description.length > 90 ? '…' : ''}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard;
