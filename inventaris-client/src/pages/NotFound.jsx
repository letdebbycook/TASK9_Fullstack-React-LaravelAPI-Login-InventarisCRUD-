import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { trackEvent, trackClickCTA } from '../utils/analytics';
import { HelpCircle, Home, Package } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_not_found_404', {
      attemptedPath: location.pathname,
      referrer: document.referrer,
    });
  }, [location.pathname]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        background: '#fff',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--r-md)',
          background: 'var(--kraft-light)',
          color: 'var(--kraft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <HelpCircle size={24} />
        </div>

        <div className="mono" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.05em' }}>
          404
        </div>

        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          Halaman Tidak Ditemukan
        </h1>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Maaf, tautan atau alamat <code className="mono" style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 'var(--r-sm)', color: 'var(--kraft)' }}>{location.pathname}</code> tidak tersedia atau telah dipindahkan.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/"
            onClick={() => trackClickCTA('404_back_to_home')}
            className="btn btn-primary"
          >
            <Home size={14} />
            <span>Ke Dashboard</span>
          </Link>
          <Link
            to="/items"
            onClick={() => trackClickCTA('404_view_items')}
            className="btn btn-ghost"
          >
            <Package size={14} />
            <span>Lihat Barang</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
