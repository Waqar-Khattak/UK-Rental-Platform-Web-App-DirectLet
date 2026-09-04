// Register Page - User registration

import React, { useState, useContext } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const REGISTER_MUTATION = gql`
  mutation Register(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
    $role: String!
  ) {
    register(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      role: $role
    ) {
      token
      user {
        id
        email
        firstName
        lastName
        role
        isVerified
      }
    }
  }
`;

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'tenant',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      const { data } = await registerMutation({ variables: formData });
      login(data.register.user, data.register.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join DirectLet — rent directly, save on fees</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>I am a</label>
            <div className="role-selector">
              <label className={`role-option ${formData.role === 'tenant' ? 'selected' : ''}`}>
                <input type="radio" name="role" value="tenant" checked={formData.role === 'tenant'} onChange={handleChange} />
                <span className="role-icon">🔑</span>
                <span>Tenant</span>
              </label>
              <label className={`role-option ${formData.role === 'landlord' ? 'selected' : ''}`}>
                <input type="radio" name="role" value="landlord" checked={formData.role === 'landlord'} onChange={handleChange} />
                <span className="role-icon">🏠</span>
                <span>Landlord</span>
              </label>
            </div>
          </div>
          <button className="btn-action btn-primary-action w-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
