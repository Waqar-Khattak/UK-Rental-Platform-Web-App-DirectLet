// Search Filters Component - Filter properties by rent, bedrooms, location

import React, { useState } from 'react';

function SearchFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    minRent: '',
    maxRent: '',
    bedrooms: '',
    city: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const cleared = { minRent: '', maxRent: '', bedrooms: '', city: '' };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <div className="search-filters-wrapper">
      <div className="search-filters">
        <div className="filter-group">
          <label>City</label>
          <input
            name="city"
            type="text"
            placeholder="e.g. London"
            value={filters.city}
            onChange={handleChange}
          />
        </div>
        <div className="filter-group">
          <label>Min Rent (£)</label>
          <input
            name="minRent"
            type="number"
            placeholder="500"
            value={filters.minRent}
            onChange={handleChange}
          />
        </div>
        <div className="filter-group">
          <label>Max Rent (£)</label>
          <input
            name="maxRent"
            type="number"
            placeholder="2000"
            value={filters.maxRent}
            onChange={handleChange}
          />
        </div>
        <div className="filter-group">
          <label>Min Bedrooms</label>
          <input
            name="bedrooms"
            type="number"
            placeholder="1"
            min="0"
            value={filters.bedrooms}
            onChange={handleChange}
          />
        </div>
      </div>
      {(filters.city || filters.minRent || filters.maxRent || filters.bedrooms) && (
        <button className="clear-filters" onClick={handleClear}>Clear Filters</button>
      )}
    </div>
  );
}

export default SearchFilters;
