// Payments Page - Stripe integration for rent and deposit payments

import React, { useState, useContext } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { AuthContext } from '../context/AuthContext';

const MY_PAYMENTS = gql`
  query MyPayments {
    myPayments {
      id
      amount
      type
      status
      stripePaymentId
      createdAt
      property {
        id
        title
        address
      }
    }
  }
`;

const MY_PROPERTIES = gql`
  query Properties {
    properties(limit: 50) {
      id
      title
      rent
      deposit
    }
  }
`;

const CREATE_PAYMENT = gql`
  mutation CreatePaymentIntent($amount: Int!, $propertyId: ID!, $type: String!) {
    createPaymentIntent(amount: $amount, propertyId: $propertyId, type: $type) {
      clientSecret
      paymentId
    }
  }
`;

const CONFIRM_PAYMENT = gql`
  mutation ConfirmPayment($paymentId: ID!) {
    confirmPayment(paymentId: $paymentId) {
      id
      status
    }
  }
`;

function Payments() {
  const { user } = useContext(AuthContext);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [paymentType, setPaymentType] = useState('rent');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const { data: paymentsData, loading: paymentsLoading, refetch } = useQuery(MY_PAYMENTS);
  const { data: propertiesData } = useQuery(MY_PROPERTIES);
  const [createPayment] = useMutation(CREATE_PAYMENT);
  const [confirmPayment] = useMutation(CONFIRM_PAYMENT);

  const payments = paymentsData?.myPayments || [];
  const properties = propertiesData?.properties || [];

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedProperty || !amount) return;
    setProcessing(true);
    try {
      const { data } = await createPayment({
        variables: { amount: parseInt(amount), propertyId: selectedProperty, type: paymentType },
      });
      // In production, use Stripe Elements to collect card details
      // For demo, we simulate payment confirmation
      await confirmPayment({ variables: { paymentId: data.createPaymentIntent.paymentId } });
      alert('Payment successful!');
      setAmount('');
      setSelectedProperty('');
      refetch();
    } catch (err) {
      alert('Payment failed: ' + err.message);
    }
    setProcessing(false);
  };

  const selectedProp = properties.find(p => p.id === selectedProperty);

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Payments</h1>
        <p className="text-muted">Manage rent and deposit payments securely via Stripe</p>
      </div>

      {/* Payment Form */}
      {user?.role === 'tenant' && (
        <div className="payment-form-card">
          <h2>Make a Payment</h2>
          <form onSubmit={handlePayment} className="payment-form">
            <div className="form-group">
              <label>Property</label>
              <select
                value={selectedProperty}
                onChange={(e) => {
                  setSelectedProperty(e.target.value);
                  const prop = properties.find(p => p.id === e.target.value);
                  if (prop) setAmount(paymentType === 'rent' ? prop.rent : prop.deposit);
                }}
                required
              >
                <option value="">Select a property</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title} — £{p.rent}/month</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => {
                  setPaymentType(e.target.value);
                  if (selectedProp) setAmount(e.target.value === 'rent' ? selectedProp.rent : selectedProp.deposit);
                }}
              >
                <option value="rent">Rent Payment</option>
                <option value="deposit">Deposit Payment</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount (£)</label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-action btn-primary-action" disabled={processing}>
              {processing ? 'Processing...' : `Pay £${amount || 0}`}
            </button>
          </form>
        </div>
      )}

      {/* Payment History */}
      <div className="dashboard-section">
        <h2>Payment History</h2>
        {paymentsLoading ? (
          <p>Loading payments...</p>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <h3>No payments yet</h3>
            <p>Your payment history will appear here</p>
          </div>
        ) : (
          <div className="properties-table">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.property?.title || 'N/A'}</td>
                    <td className="capitalize">{payment.type}</td>
                    <td>£{payment.amount}</td>
                    <td>
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{new Date(parseInt(payment.createdAt)).toLocaleDateString()}</td>
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

export default Payments;
