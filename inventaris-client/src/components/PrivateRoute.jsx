import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * PrivateRoute — redirects to /login if not authenticated.
 * When `showSidebar` is true it just renders children (used to
 * conditionally show the Sidebar without double-wrapping the page).
 */
const PrivateRoute = ({ children, showSidebar = false }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <Loader2 size={28} style={{ color: 'var(--kraft)', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Memverifikasi sesi…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showSidebar) return null; // don't render sidebar at all
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
