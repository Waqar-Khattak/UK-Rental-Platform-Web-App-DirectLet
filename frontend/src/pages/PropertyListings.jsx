// Property Listings Page - Browse and search rental properties

import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';
import MapView from '../components/MapView';

const PROPERTIES_QUERY = gql`
  query Properties($skip: Int, $limit: Int, $city: String, $minRent: Int, $maxRent: Int, $bedrooms: Int) {
    properties(skip: $skip, limit: $limit, city: $city, minRent: $minRent, maxRent: $maxRent, bedrooms: $bedrooms) {
      id
      title
      description
      rent
      deposit
      bedrooms
      bathrooms
      city
      address
      latitude
      longitude
      images
      viewCount
      createdAt
    }
  }
`;

function PropertyListings() {
  const [filters, setFilters] = useState({});
  const [showMap, setShowMap] = useState(false);

  const variables = {};
  if (filters.city) variables.city = filters.city;
  if (filters.minRent) variables.minRent = parseInt(filters.minRent);
  if (filters.maxRent) variables.maxRent = parseInt(filters.maxRent);
  if (filters.bedrooms) variables.bedrooms = parseInt(filters.bedrooms);

  const { loading, error, data } = useQuery(PROPERTIES_QUERY, { variables });

  const properties = data?.properties || [];

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Find Your Perfect Rental</h1>
        <p className="text-muted">Browse verified properties directly from landlords — no agent fees</p>
      </div>

      <SearchFilters onFilterChange={setFilters} />

      <div className="view-toggle">
        <button
          className={`toggle-btn ${!showMap ? 'active' : ''}`}
          onClick={() => setShowMap(false)}
        >
          Grid View
        </button>
        <button
          className={`toggle-btn ${showMap ? 'active' : ''}`}
          onClick={() => setShowMap(true)}
        >
          Map View
        </button>
        <span className="results-count">{properties.length} properties found</span>
      </div>

      {loading && (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading properties...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">Error loading properties: {error.message}</div>}

      {!loading && !error && (
        showMap ? (
          <MapView properties={properties} />
        ) : (
          <div className="properties-grid">
            {properties.length === 0 ? (
              <div className="empty-state">
                <h3>No properties found</h3>
                <p>Try adjusting your search filters</p>
              </div>
            ) : (
              properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        )
      )}
    </div>
  );
}

export default PropertyListings;
