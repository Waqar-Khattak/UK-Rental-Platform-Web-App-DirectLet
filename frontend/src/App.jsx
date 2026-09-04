import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import apolloClient from './apollo/apolloClient';
import AuthContextProvider, { AuthContext } from './context/AuthContext';
import NavBar from './components/NavBar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyListings from './pages/PropertyListings';
import PropertyDetail from './pages/PropertyDetail';
import Messages from './pages/Messages';
import LandlordDashboard from './pages/LandlordDashboard';
import Payments from './pages/Payments';
import ScheduleViewing from './pages/ScheduleViewing';
import VerificationCenter from './pages/VerificationCenter';
import AdminVerifications from './pages/AdminVerifications';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div key={location.pathname} className="route-transition">
      <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      <Route path="/" element={<ProtectedRoute><PropertyListings /></ProtectedRoute>} />
      <Route path="/property/:id" element={<ProtectedRoute><PropertyDetail /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/schedule-viewing/:propertyId" element={<ProtectedRoute><ScheduleViewing /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute roles={['landlord', 'admin']}><LandlordDashboard /></ProtectedRoute>} />
      <Route path="/verification" element={<ProtectedRoute><VerificationCenter /></ProtectedRoute>} />
      <Route path="/admin/verifications" element={<ProtectedRoute roles={["admin"]}><AdminVerifications /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  useEffect(() => {
    const root = document.documentElement;
    const updatePointer = (event) => {
      root.style.setProperty('--pointer-x', `${event.clientX}px`);
      root.style.setProperty('--pointer-y', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', updatePointer, { passive: true });
    return () => window.removeEventListener('pointermove', updatePointer);
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <AuthContextProvider>
        <Router>
          <div className="app-shell">
            <NavBar />
            <main className="page-content">
              <AppRoutes />
            </main>
          </div>
        </Router>
      </AuthContextProvider>
    </ApolloProvider>
  );
}

export default App;
