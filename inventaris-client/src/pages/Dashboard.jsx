import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Package, Tags, TrendingUp, AlertTriangle, ArrowRight, Download, RefreshCw } from 'lucide-react';

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

const StockStatus = ({ stock }) => {
  const n = Number(stock);
  if (n === 0)  return <span className="stock-indicator"><span className="stock-dot crit" /><span className="stock-label crit" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>Habis</span></span>;
  if (n <= 5)   return <span className="stock-indicator"><span className="stock-dot crit" /><span className="stock-label crit" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>Kritis ({n})</span></span>;
  if (n < 10)   return <span className="stock-indicator"><span className="stock-dot low" /><span className="stock-label low" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>Menipis ({n})</span></span>;
  return        <span className="stock-indicator"><span className="stock-dot ok" /><span className="stock-label ok" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>Aman ({n})</span></span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [itemsRes, catRes] = await Promise.all([
        axiosClient.get('/items'),
        axiosClient.get('/categories'),
      ]);
      setItems(itemsRes.data.data || []);
      setCategories(catRes.data.data || []);
      if (isRefresh) toast.success('Data dashboard berhasil diperbarui.', 'Diperbarui');
    } catch {
      toast.error('Gagal mengambil data dari server API.', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalItems = items.length;
  const totalCategories = categories.length;
  const totalValuation = items.reduce((acc, it) => acc + Number(it.stock) * Number(it.price), 0);
  const lowStockItems = items.filter((it) => Number(it.stock) < 10);

  const handleBackupExport = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), exporter: user?.email, categories, items }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_inventaris_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    toast.success(`${items.length} barang berhasil di-export sebagai JSON.`, 'Backup Selesai');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Selamat datang, {user?.name || 'Administrator'} — ringkasan inventaris Anda.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              id="btn-refresh-dashboard"
              className="btn btn-ghost"
            >
              <RefreshCw size={14} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleBackupExport}
              id="btn-export-backup"
              className="btn btn-ghost"
            >
              <Download size={14} />
              Backup JSON
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Barang</div>
          <div className="metric-value">{loading ? '—' : totalItems}</div>
          <div className="metric-sub">Barang aktif di sistem</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Kategori</div>
          <div className="metric-value">{loading ? '—' : totalCategories}</div>
          <div className="metric-sub">Klasifikasi produk</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Nilai Inventaris</div>
          <div className="metric-value" style={{ fontSize: '1.125rem' }}>
            {loading ? '—' : formatIDR(totalValuation)}
          </div>
          <div className="metric-sub">Akumulasi stok × harga</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Stok Kritis (&lt; 10)</div>
          <div className={`metric-value${lowStockItems.length > 0 ? ' alert' : ''}`}>
            {loading ? '—' : lowStockItems.length}
          </div>
          <div className="metric-sub">Perlu pengadaan ulang</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quickaction-grid">
        <Link to="/items" className="quickaction-card" id="qa-goto-items">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div className="quickaction-icon"><Package size={18} /></div>
            <div>
              <div className="quickaction-label">Kelola Barang</div>
              <div className="quickaction-sub">Tambah, edit, hapus barang & SKU</div>
            </div>
          </div>
          <ArrowRight size={15} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
        </Link>

        <Link to="/categories" className="quickaction-card" id="qa-goto-categories">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div className="quickaction-icon"><Tags size={18} /></div>
            <div>
              <div className="quickaction-label">Kelola Kategori</div>
              <div className="quickaction-sub">Susun kelompok klasifikasi produk</div>
            </div>
          </div>
          <ArrowRight size={15} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
        </Link>
      </div>

      {/* Recent Items Table */}
      <div>
        <div className="section-header" style={{ background: '#fff', borderRadius: 'var(--r-lg) var(--r-lg) 0 0', border: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="section-title">Barang Terbaru</div>
            <div className="section-sub">Snapshot 5 produk terakhir di sistem inventaris</div>
          </div>
          <Link to="/items" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--kraft)', textDecoration: 'none' }}>
            Lihat Semua ({totalItems}) <ArrowRight size={13} />
          </Link>
        </div>

        <div className="table-wrap" style={{ borderRadius: '0 0 var(--r-lg) var(--r-lg)', borderTop: 'none' }}>
          <table className="inv-table">
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>SKU</th>
                <th>Kategori</th>
                <th>Stok</th>
                <th>Harga Satuan</th>
                <th>Status Stok</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="table-empty">Memuat data barang…</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty">
                    <div className="table-empty-title">Belum ada barang</div>
                    <div className="table-empty-sub">Tambah barang baru di halaman Barang.</div>
                  </td>
                </tr>
              ) : (
                items.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{item.sku}</td>
                    <td>
                      <span style={{ padding: '0.2em 0.5em', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: '0.75rem' }}>
                        {item.category?.name || '—'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{item.stock}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{formatIDR(item.price)}</td>
                    <td><StockStatus stock={item.stock} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Dashboard;
