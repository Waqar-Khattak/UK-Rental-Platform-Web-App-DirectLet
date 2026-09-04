// Schedule Viewing Page - Book property viewing appointments

import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { AuthContext } from '../context/AuthContext';

const PROPERTY_QUERY = gql`
  query Property($id: ID!) {
    property(id: $id) {
      id
      title
      address
      city
      rent
      landlord {
        firstName
        lastName
      }
    }
  }
`;

const SCHEDULE_VIEWING = gql`
  mutation ScheduleViewing($propertyId: ID!, $scheduledDate: String!, $notes: String) {
    scheduleViewing(propertyId: $propertyId, scheduledDate: $scheduledDate, notes: $notes) {
      id
      scheduledDate
      status
    }
  }
`;

const MY_VIEWINGS = gql`
  query MyViewings {
    myViewings {
      id
      scheduledDate
      status
      notes
      property {
        title
        address
        city
      }
      landlord {
        firstName
        lastName
      }
    }
  }
`;

function ScheduleViewing() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ date: '', time: '', notes: '' });

  const { data: propertyData } = useQuery(PROPERTY_QUERY, {
    variables: { id: propertyId },
    skip: !propertyId,
  });
  const { data: viewingsData, loading: viewingsLoading } = useQuery(MY_VIEWINGS);
  const [scheduleViewing] = useMutation(SCHEDULE_VIEWING);

  const property = propertyData?.property;
  const viewings = viewingsData?.myViewings || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!propertyId) return;
    const scheduledDate = `${formData.date}T${formData.time}:00`;
    try {
      await scheduleViewing({
        variables: { propertyId, scheduledDate, notes: formData.notes },
      });
      alert('Viewing scheduled successfully!');
      navigate('/');
    } catch (err) {
      alert('Failed to schedule: ' + err.message);
    }
  };

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Schedule a Viewing</h1>
        <p className="text-muted">Book a time to visit the property in person</p>
      </div>

      {/* Booking Form */}
      {propertyId && property && (
        <div className="viewing-form-card">
          <div className="viewing-property-info">
            <h3>{property.title}</h3>
            <p>{property.address}, {property.city}</p>
            <p className="text-muted">Listed by {property.landlord?.firstName} {property.landlord?.lastName}</p>
          </div>
          <form onSubmit={handleSubmit} className="viewing-form">
            <div className="form-group">
              <label>Preferred Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>Preferred Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Notes (optional)</label>
              <textarea
                name="notes"
                placeholder="Any specific questions or requirements..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="3"
              />
            </div>
            <button type="submit" className="btn-action btn-primary-action">
              Request Viewing
            </button>
          </form>
        </div>
      )}

      {/* My Viewings */}
      <div className="dashboard-section">
        <h2>My Scheduled Viewings</h2>
        {viewingsLoading ? (
          <p>Loading viewings...</p>
        ) : viewings.length === 0 ? (
          <div className="empty-state">
            <h3>No viewings scheduled</h3>
            <p>Browse properties and schedule your first viewing</p>
          </div>
        ) : (
          <div className="viewings-list">
            {viewings.map((viewing) => (
              <div key={viewing.id} className="viewing-card">
                <div className="viewing-info">
                  <h4>{viewing.property?.title}</h4>
                  <p>{viewing.property?.address}, {viewing.property?.city}</p>
                  <p className="text-muted">
                    {new Date(parseInt(viewing.scheduledDate)).toLocaleDateString()} at{' '}
                    {new Date(parseInt(viewing.scheduledDate)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {viewing.notes && <p className="viewing-notes">Notes: {viewing.notes}</p>}
                </div>
                <span className={`status-badge ${viewing.status}`}>
                  {viewing.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScheduleViewing;
