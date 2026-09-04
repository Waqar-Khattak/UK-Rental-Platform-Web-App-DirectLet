// Verification Center - Identity and trust verification system

import React, { useContext } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { AuthContext } from '../context/AuthContext';

const MY_VERIFICATIONS = gql`
  query MyVerifications {
    myVerifications {
      id
      type
      status
      verificationDate
      createdAt
    }
  }
`;

const SUBMIT_VERIFICATION = gql`
  mutation SubmitVerification($type: String!, $documentUrl: String) {
    submitVerification(type: $type, documentUrl: $documentUrl) {
      id
      type
      status
    }
  }
`;

const verificationTypes = [
  { key: 'email', label: 'Email Verification', icon: '✉', description: 'Verify your email address to confirm account ownership' },
  { key: 'phone', label: 'Phone Verification', icon: '📱', description: 'Verify your phone number for secure communication' },
  { key: 'document', label: 'ID Document', icon: '🪪', description: 'Upload a government-issued photo ID for identity confirmation' },
  { key: 'background_check', label: 'Background Check', icon: '🔍', description: 'Optional enhanced check for premium trust status' },
];

function VerificationCenter() {
  const { user } = useContext(AuthContext);
  const { data, loading, refetch } = useQuery(MY_VERIFICATIONS);
  const [submitVerification] = useMutation(SUBMIT_VERIFICATION);

  const verifications = data?.myVerifications || [];

  const getStatus = (type) => {
    const v = verifications.find(ver => ver.type === type);
    return v ? v.status : 'not_submitted';
  };

  const handleSubmit = async (type) => {
    try {
      await submitVerification({ variables: { type, documentUrl: '' } });
      alert(`${type} verification submitted for review`);
      refetch();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const completedCount = verifications.filter(v => v.status === 'verified').length;
  const trustScore = Math.round((completedCount / verificationTypes.length) * 100);

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Identity Verification</h1>
        <p className="text-muted">Build trust by verifying your identity — verified users get more enquiries</p>
      </div>

      {/* Trust Score */}
      <div className="trust-score-card">
        <div className="trust-score-circle">
          <span className="trust-value">{trustScore}%</span>
        </div>
        <div className="trust-info">
          <h3>Trust Score</h3>
          <p>{completedCount} of {verificationTypes.length} verifications complete</p>
          {user?.isVerified && <span className="verified-badge">✓ Verified Account</span>}
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="verification-checklist">
        {loading ? (
          <p>Loading verifications...</p>
        ) : (
          verificationTypes.map((vType) => {
            const status = getStatus(vType.key);
            return (
              <div key={vType.key} className={`verification-item ${status}`}>
                <div className="verification-icon">{vType.icon}</div>
                <div className="verification-details">
                  <h4>{vType.label}</h4>
                  <p>{vType.description}</p>
                </div>
                <div className="verification-action">
                  {status === 'verified' ? (
                    <span className="status-badge verified">✓ Verified</span>
                  ) : status === 'pending' ? (
                    <span className="status-badge pending">Pending Review</span>
                  ) : status === 'failed' ? (
                    <button className="btn-action btn-secondary-action" onClick={() => handleSubmit(vType.key)}>
                      Retry
                    </button>
                  ) : (
                    <button className="btn-action btn-primary-action" onClick={() => handleSubmit(vType.key)}>
                      Verify
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default VerificationCenter;
