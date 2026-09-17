import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import { trackFormSubmit, trackClickCTA } from '../utils/analytics';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  X,
  Package,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Slideover State
  const [isSlideoverOpen, setIsSlideoverOpen] = useState(false);
  const [slideoverMode, setSlideoverMode] = useState('create'); // 'create' | 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Anti-spam honeypot field
  const [honeypot, setHoneypot] = useState('');

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const fetchCategories = async (notify = false) => {
    try {
      if (!notify) setLoading(true);
      const res = await axiosClient.get('/categories');
      setCategories(res.data.data || []);
      if (notify) {
        toast.success('Daftar kategori berhasil diperbarui!', 'Kategori Sinkron');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Gagal mengambil daftar kategori dari API backend.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories by search
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open Create Slide-over
  const handleOpenCreate = () => {
    setSlideoverMode('create');
    setCurrentCategory(null);
    setCategoryName('');
    setFormError('');
    setHoneypot('');
    setIsSlideoverOpen(true);
    trackClickCTA('open_create_category_slideover');
  };

  // Open Edit Slide-over
  const handleOpenEdit = (cat) => {
    setSlideoverMode('edit');
    setCurrentCategory(cat);
    setCategoryName(cat.name);
    setFormError('');
    setHoneypot('');
    setIsSlideoverOpen(true);
    trackClickCTA('open_edit_category_slideover');
  };

  const handleCloseSlideover = () => {
    setIsSlideoverOpen(false);
  };

  // Handle Form Submit (Create / Update)
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    setFormError('');

    // Honeypot check
    if (honeypot.trim() !== '') {
      toast.error('Spam terdeteksi! Formulir ditolak.', 'Anti-Spam');
      trackFormSubmit('category_form', 'spam_rejected');
      return;
    }

    if (!categoryName.trim()) {
      const msg = 'Nama kategori wajib diisi.';
      setFormError(msg);
      toast.warning(msg, 'Validasi');
      return;
    }

    setFormLoading(true);

    try {
      if (slideoverMode === 'create') {
        const res = await axiosClient.post('/categories', { name: categoryName.trim() });
        const newCat = res.data.data;
        setCategories((prev) => [...prev, newCat]);
        setIsSlideoverOpen(false);
        trackFormSubmit('category_create', 'success', { name: newCat.name });
        toast.success(`Kategori "${newCat.name}" berhasil dibuat!`, 'Berhasil');
      } else {
        const res = await axiosClient.put(`/categories/${currentCategory.id}`, { name: categoryName.trim() });
        const updated = res.data.data;
        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? { ...c, name: updated.name } : c))
        );
        setIsSlideoverOpen(false);
        trackFormSubmit('category_update', 'success', { id: currentCategory.id, name: updated.name });
        toast.success(`Kategori "${updated.name}" berhasil diperbarui!`, 'Berhasil');
      }
    } catch (error) {
      console.error('Category form error:', error);
      let msg = 'Terjadi kesalahan saat menyimpan kategori.';
      if (error.response?.data?.errors?.name) {
        msg = error.response.data.errors.name[0];
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }
      setFormError(msg);
      toast.error(msg, 'Gagal Menyimpan');
      trackFormSubmit('category_form', 'error', { error: msg });
    } finally {
      setFormLoading(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
    trackClickCTA('open_delete_category_modal');
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleteLoading(true);

    try {
      const catName = categoryToDelete.name;
      await axiosClient.delete(`/categories/${categoryToDelete.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);

      toast.success(`Kategori "${catName}" berhasil dihapus.`, 'Kategori Dihapus');
      trackFormSubmit('category_delete', 'success', { name: catName });
    } catch (error) {
      console.error('Delete category error:', error);
      const msg = error.response?.data?.message || 'Gagal menghapus kategori.';
      toast.error(msg, 'Gagal Menghapus');
      trackFormSubmit('category_delete', 'error', { error: msg });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Klasifikasi & Kategori Barang</h1>
            <p className="page-subtitle">
              Struktur pengelompokan inventaris gudang untuk mempermudah audit fisik dan penyaringan laporan.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fetchCategories(true)}
              className="btn btn-ghost"
              title="Sinkronkan data dengan API"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              id="btn-add-category"
              className="btn btn-primary"
            >
              <Plus size={15} />
              <span>Tambah Kategori</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama klasifikasi / kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Hairline Table */}
      <div className="table-wrap">
        <table className="inv-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Kode ID</th>
              <th style={{ width: '45%' }}>Nama Kategori</th>
              <th style={{ width: '25%' }}>Jumlah Barang Terkait</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Memuat data kategori dari API...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <FolderOpen size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>
                    Tidak ada kategori ditemukan
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
                    {searchQuery
                      ? 'Tidak ada kategori yang sesuai dengan kata kunci pencarian.'
                      : 'Belum ada kategori terdaftar. Klik "Tambah Kategori" untuk membuat.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => {
                const itemCount = cat.items_count !== undefined ? cat.items_count : cat.items?.length;
                return (
                  <tr key={cat.id}>
                    <td>
                      <span className="mono" style={{ color: 'var(--text-faint)' }}>
                        #{cat.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {cat.name}
                      </div>
                    </td>
                    <td>
                      <span className="mono" style={{ color: 'var(--text-muted)' }}>
                        {itemCount !== undefined ? `${itemCount} barang` : '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="btn-icon edit"
                          title="Edit kategori"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(cat)}
                          className="btn-icon danger"
                          title="Hapus kategori"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-Over Panel (Form Tambah / Edit dari kanan) */}
      {isSlideoverOpen && (
        <div className="slideover-backdrop" onClick={handleCloseSlideover}>
          <div
            className="slideover-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="slideover-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tags size={18} style={{ color: 'var(--kraft)' }} />
                <h3 className="slideover-title">
                  {slideoverMode === 'create' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseSlideover}
                className="btn-icon"
                title="Tutup panel"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCategory} style={{ display: 'contents' }} noValidate>
              <div className="slideover-body">
                {/* Honeypot anti-spam */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input
                    type="text"
                    name="_hp_cat"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cat-name">
                    Nama Kategori <span className="req">*</span>
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    required
                    placeholder="Contoh: Elektronik Kantor, Mebel, Alat Tulis"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="form-input"
                    autoFocus
                  />
                  {formError && (
                    <span className="form-error">{formError}</span>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '0.25rem' }}>
                    Nama kategori akan menjadi acuan pengelompokan barang dan filter inventaris.
                  </p>
                </div>
              </div>

              <div className="slideover-footer">
                <button
                  type="button"
                  onClick={handleCloseSlideover}
                  className="btn btn-ghost"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn btn-primary"
                >
                  {formLoading ? 'Menyimpan...' : slideoverMode === 'create' ? 'Simpan Kategori' : 'Perbarui Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal-backdrop" onClick={() => setDeleteModalOpen(false)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--r-sm)',
                background: 'var(--danger-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--danger)',
                flexShrink: 0,
              }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="modal-title">Hapus Kategori?</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Tindakan ini permanen</p>
              </div>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Apakah Anda yakin ingin menghapus kategori <strong>"{categoryToDelete?.name}"</strong>? Pastikan tidak ada barang aktif yang masih menggunakan kategori ini.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="btn btn-ghost"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="btn btn-danger"
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
