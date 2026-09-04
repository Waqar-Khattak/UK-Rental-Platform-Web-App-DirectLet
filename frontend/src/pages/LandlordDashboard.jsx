// Landlord Dashboard - Analytics, property management, performance

import React, { useContext, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { AuthContext } from '../context/AuthContext';

const DASHBOARD_STATS = gql`
  query DashboardStats {
    dashboardStats {
      totalProperties
      totalViews
      totalMessages
      activeListings
      totalViewings
      totalPayments
      averageRent
      averageViews
      totalInquiries
      totalRentPayments
      totalDepositPayments
    }
  }
`;

const TOP_PROPERTIES = gql`
  query TopProperties($limit: Int) {
    topProperties(limit: $limit) {
      property {
        id
        title
        city
        rent
        bedrooms
        bathrooms
      }
      views
      inquiries
      scheduledViewings
    }
  }
`;

const MY_PROPERTIES = gql`
  query MyProperties {
    myProperties {
      id
      title
      city
      rent
      bedrooms
      bathrooms
      viewCount
      isActive
      createdAt
    }
  }
`;

const CREATE_PROPERTY = gql`
  mutation CreateProperty(
    $title: String!, $description: String, $address: String, $city: String,
    $postcode: String, $bedrooms: Int, $bathrooms: Int, $rent: Int!, $deposit: Int,
    $images: [String], $amenities: [String]
  ) {
    createProperty(
      title: $title, description: $description, address: $address, city: $city,
      postcode: $postcode, bedrooms: $bedrooms, bathrooms: $bathrooms, rent: $rent,
      deposit: $deposit, images: $images, amenities: $amenities
    ) {
      id
      title
    }
  }
`;

const DELETE_PROPERTY = gql`
  mutation DeleteProperty($id: ID!) {
    deleteProperty(id: $id)
  }
`;

function LandlordDashboard() {
  const { user } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', address: '', city: '', postcode: '',
    bedrooms: 1, bathrooms: 1, rent: 0, deposit: 0,
  });
  const [imagesFiles, setImagesFiles] = useState([]);

  const { data: statsData, loading: statsLoading } = useQuery(DASHBOARD_STATS);
  const { data: topPropsData, loading: topPropsLoading } = useQuery(TOP_PROPERTIES, { variables: { limit: 5 } });
  const { data: propsData, loading: propsLoading, refetch } = useQuery(MY_PROPERTIES);
  const [createProperty] = useMutation(CREATE_PROPERTY);
  const [deleteProperty] = useMutation(DELETE_PROPERTY);

  if (user?.role !== 'landlord' && user?.role !== 'admin') {
    return <div className="container"><div className="alert alert-danger">Access denied. Landlords only.</div></div>;
  }

  const stats = statsData?.dashboardStats;
  const properties = propsData?.myProperties || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Upload images first (if any)
      let uploadedUrls = [];
      if (imagesFiles && imagesFiles.length > 0) {
        const form = new FormData();
        for (let i = 0; i < imagesFiles.length; i++) form.append('images', imagesFiles[i]);
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('directlet_token');
        const res = await fetch(`${apiBase}/api/uploads`, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: form,
        });
        if (!res.ok) throw new Error('Image upload failed');
        const json = await res.json();
        uploadedUrls = json.files.map(f => (f.url.startsWith('http') ? f.url : `${apiBase}${f.url}`));
      }
      await createProperty({
        variables: {
          ...formData,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          rent: parseInt(formData.rent),
          deposit: parseInt(formData.deposit),
          images: uploadedUrls,
        },
      });
      setShowForm(false);
      setFormData({ title: '', description: '', address: '', city: '', postcode: '', bedrooms: 1, bathrooms: 1, rent: 0, deposit: 0 });
      setImagesFiles([]);
      refetch();
    } catch (err) {
      alert('Error creating property: ' + err.message);
    }
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImagesFiles(files);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await deleteProperty({ variables: { id } });
      refetch();
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  const topProperties = topPropsData?.topProperties || [];

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Landlord Dashboard</h1>
        <p className="text-muted">Manage your properties and track performance</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsLoading ? (
          <p>Loading stats...</p>
        ) : (
          <>
            <div className="stat-card">
              <span className="stat-icon">🏠</span>
              <div className="stat-info">
                <span className="stat-value">{stats?.totalProperties || 0}</span>
                <span className="stat-label">Properties</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">👁</span>
              <div className="stat-info">
                <span className="stat-value">{stats?.totalViews || 0}</span>
                <span className="stat-label">Total Views</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">💬</span>
              <div className="stat-info">
                <span className="stat-value">{stats?.totalMessages || 0}</span>
                <span className="stat-label">Messages</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📈</span>
              <div className="stat-info">
                <span className="stat-value">£{stats?.averageRent?.toFixed(0) || 0}</span>
                <span className="stat-label">Avg Rent</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">👤</span>
              <div className="stat-info">
                <span className="stat-value">{stats?.totalInquiries || 0}</span>
                <span className="stat-label">Inquiries</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">💷</span>
              <div className="stat-info">
                <span className="stat-value">£{stats?.totalRentPayments || 0}</span>
                <span className="stat-label">Rent Collected</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="analytics-overview">
        <div className="analytics-card">
          <h3>Performance Overview</h3>
          <div className="analytics-metrics">
            <div>
              <span className="metric-value">{stats?.averageViews?.toFixed(1) || 0}</span>
              <span className="metric-label">Avg Views / Property</span>
            </div>
            <div>
              <span className="metric-value">£{stats?.totalDepositPayments || 0}</span>
              <span className="metric-label">Deposit Payments</span>
            </div>
            <div>
              <span className="metric-value">{stats?.activeListings || 0}</span>
              <span className="metric-label">Active Listings</span>
            </div>
          </div>
        </div>
        <div className="analytics-card">
          <h3>Top Properties</h3>
          {topPropsLoading ? (
            <p>Loading top properties...</p>
          ) : topProperties.length === 0 ? (
            <p>No top-performing properties yet.</p>
          ) : (
            <div className="top-properties-list">
              {topProperties.map((item) => (
                <div key={item.property.id} className="top-property-item">
                  <div>
                    <strong>{item.property.title}</strong>
                    <p>{item.property.city} • £{item.property.rent}/mo • {item.property.bedrooms} bed</p>
                  </div>
                  <div className="top-property-metrics">
                    <span>{item.views} views</span>
                    <span>{item.inquiries} inquiries</span>
                    <span>{item.scheduledViewings} viewings</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Property */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>My Properties</h2>
          <button className="btn-action btn-primary-action" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Property'}
          </button>
        </div>

        {showForm && (
          <form className="property-form" onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Postcode</label>
                <input type="text" value={formData.postcode} onChange={(e) => setFormData({...formData, postcode: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Rent (£/month) *</label>
                <input type="number" value={formData.rent} onChange={(e) => setFormData({...formData, rent: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Deposit (£)</label>
                <input type="number" value={formData.deposit} onChange={(e) => setFormData({...formData, deposit: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Bedrooms</label>
                <input type="number" min="0" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Bathrooms</label>
                <input type="number" min="0" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: e.target.value})} />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group full-width">
                <label>Images</label>
                <input type="file" multiple accept="image/*" onChange={handleFilesChange} />
                {imagesFiles.length > 0 && (
                  <div className="image-preview-list">
                    {imagesFiles.map((f, idx) => <div key={idx} className="image-preview-item">{f.name}</div>)}
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="btn-action btn-primary-action">Create Property</button>
          </form>
        )}

        {/* Properties Table */}
        {propsLoading ? (
          <p>Loading properties...</p>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <h3>No properties yet</h3>
            <p>Click "Add Property" to list your first rental</p>
          </div>
        ) : (
          <div className="properties-table">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>City</th>
                  <th>Rent</th>
                  <th>Beds</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((prop) => (
                  <tr key={prop.id}>
                    <td className="prop-title">{prop.title}</td>
                    <td>{prop.city}</td>
                    <td>£{prop.rent}</td>
                    <td>{prop.bedrooms}</td>
                    <td>{prop.viewCount || 0}</td>
                    <td>
                      <span className={`status-badge ${prop.isActive ? 'active' : 'inactive'}`}>
                        {prop.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(prop.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandlordDashboard;
