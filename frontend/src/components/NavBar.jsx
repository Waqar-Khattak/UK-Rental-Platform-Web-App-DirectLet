// Navigation Bar Component

import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'nav-active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span className="brand-icon">⌂</span> DirectLet
      </Link>
      <div className="nav-links">
        {!user ? (
          <>
            <Link to="/login" className={isActive('/login')}>Login</Link>
            <Link to="/register" className={`btn-nav-primary ${isActive('/register')}`}>Register</Link>
          </>
        ) : (
          <>
            <Link to="/" className={isActive('/')}>Properties</Link>
            <Link to="/messages" className={isActive('/messages')}>Messages</Link>
            <Link to="/payments" className={isActive('/payments')}>Payments</Link>
            {(user.role === 'landlord' || user.role === 'admin') && (
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin/verifications" className={isActive('/admin/verifications')}>Admin</Link>
            )}
            <Link to="/verification" className={isActive('/verification')}>Verification</Link>
            <div className="nav-user">
              <span className="nav-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</span>
              <button onClick={logout} className="btn-nav-logout">Logout</button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
