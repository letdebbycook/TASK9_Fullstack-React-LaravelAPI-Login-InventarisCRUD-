import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import { trackFormSubmit, trackClickCTA } from '../utils/analytics';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Download,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  FolderOpen,
  ArrowUpDown,
} from 'lucide-react';

const Items = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  // Slideover State (Create / Edit)
  const [isSlideoverOpen, setIsSlideoverOpen] = useState(false);
  const [slideoverMode, setSlideoverMode] = useState('create'); // 'create' | 'edit'
  const [currentItem, setCurrentItem] = useState(null);

  // Form Fields
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Anti-spam honeypot
  const [honeypot, setHoneypot] = useState('');

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  // Load initial items & categories
  const fetchData = async (notify = false) => {
    try {
      if (!notify) setLoading(true);
      const [itemsRes, catRes] = await Promise.all([
        axiosClient.get(selectedCategory ? `/items?category_id=${selectedCategory}` : '/items'),
        axiosClient.get('/categories'),
      ]);

      setItems(itemsRes.data.data || []);
      setCategories(catRes.data.data || []);

      if (notify) {
        toast.success('Daftar barang dan kategori berhasil disinkronkan.', 'Data Diperbarui');
      }
    } catch (error) {
      console.error('Error loading items data:', error);
      toast.error('Gagal mengambil data dari server API.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  // Handle category filter change with notification
  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedCategory(val);
    trackClickCTA('filter_item_category', val);

    if (val) {
      const cat = categories.find((c) => String(c.id) === String(val));
      toast.info(`Menampilkan barang untuk kategori: "${cat?.name || 'Terpilih'}"`, 'Filter Kategori');
    } else {
      toast.info('Menampilkan semua kategori barang.', 'Filter Direset');
    }
  };

  // Format currency
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Auto-generate SKU helper
  const generateSkuHelper = () => {
    const prefix = categoryId
      ? categories.find((c) => String(c.id) === String(categoryId))?.name.substring(0, 3).toUpperCase() || 'ITM'
      : 'ITM';
    const rand = Math.floor(100 + Math.random() * 900);
    const newSku = `${prefix}-${rand}`;
    setSku(newSku);
    toast.info(`SKU otomatis dibuat: ${newSku}`, 'SKU Generator');
  };

  // Open Create Slide-over
  const handleOpenCreate = () => {
    setSlideoverMode('create');
    setCurrentItem(null);
    setCategoryId(categories[0]?.id ? String(categories[0].id) : '');
    setName('');
    setSku('');
    setStock('');
    setPrice('');
    setFormErrors({});
    setHoneypot('');
    setIsSlideoverOpen(true);
    trackClickCTA('open_create_item_slideover');
  };

  // Open Edit Slide-over
  const handleOpenEdit = (item) => {
    setSlideoverMode('edit');
    setCurrentItem(item);
    setCategoryId(String(item.category_id || item.category?.id || ''));
    setName(item.name);
    setSku(item.sku);
    setStock(item.stock);
    setPrice(item.price);
    setFormErrors({});
    setHoneypot('');
    setIsSlideoverOpen(true);
    trackClickCTA('open_edit_item_slideover');
  };

  // Close Slideover
  const handleCloseSlideover = () => {
    setIsSlideoverOpen(false);
  };

  // Submit Item Form
  const handleSubmitItem = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Honeypot check
    if (honeypot.trim() !== '') {
      toast.error('Spam bot detected! Pengiriman barang dibatalkan.', 'Anti-Spam');
      trackFormSubmit('item_form', 'spam_rejected');
      return;
    }

    // Client validation
    const errors = {};
    if (!categoryId) errors.category_id = ['Kategori wajib dipilih.'];
    if (!name.trim()) errors.name = ['Nama barang wajib diisi.'];
    if (!sku.trim()) errors.sku = ['SKU wajib diisi.'];
    if (stock === '' || isNaN(stock) || Number(stock) < 0) errors.stock = ['Stok harus berupa angka minimal 0.'];
    if (price === '' || isNaN(price) || Number(price) < 0) errors.price = ['Harga harus berupa angka minimal 0.'];

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.warning('Silakan periksa kembali isian formulir barang.', 'Validasi Form');
      return;
    }

    setFormLoading(true);

    const payload = {
      category_id: categoryId,
      name: name.trim(),
      sku: sku.trim(),
      stock: parseInt(stock, 10),
      price: parseFloat(price),
    };

    try {
      if (slideoverMode === 'create') {
        const res = await axiosClient.post('/items', payload);
        const newItem = res.data.data;
        setItems((prev) => [newItem, ...prev]);
        setIsSlideoverOpen(false);
        trackFormSubmit('item_create', 'success', { name: newItem.name, sku: newItem.sku });
        toast.success(`Barang "${newItem.name}" (SKU: ${newItem.sku}) berhasil ditambahkan!`, 'Barang Ditambahkan');
      } else {
        const res = await axiosClient.put(`/items/${currentItem.id}`, payload);
        const updated = res.data.data;
        setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
        setIsSlideoverOpen(false);
        trackFormSubmit('item_update', 'success', { id: currentItem.id, name: updated.name });
        toast.success(`Barang "${updated.name}" berhasil diperbarui!`, 'Barang Diperbarui');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        const firstErr = Object.values(error.response.data.errors)[0]?.[0] || 'Validasi gagal.';
        toast.error(firstErr, 'Validasi Server');
      } else {
        const msg = error.response?.data?.message || 'Gagal menyimpan barang.';
        toast.error(msg, 'Gagal Menyimpan');
      }
      trackFormSubmit('item_form', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Action
  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
    trackClickCTA('open_delete_item_modal');
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);

    try {
      const itemName = itemToDelete.name;
      await axiosClient.delete(`/items/${itemToDelete.id}`);
      setItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);

      toast.success(`Barang "${itemName}" berhasil dihapus dari sistem.`, 'Barang Dihapus');
      trackFormSubmit('item_delete', 'success', { name: itemName });
    } catch (error) {
      console.error('Delete item error:', error);
      const msg = error.response?.data?.message || 'Gagal menghapus barang.';
      toast.error(msg, 'Gagal Menghapus');
      trackFormSubmit('item_delete', 'error', { error: msg });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Export CSV Data Backup
  const handleExportCSV = () => {
    trackClickCTA('export_items_csv');
    if (items.length === 0) {
      toast.warning('Tidak ada data barang untuk di-export.', 'Data Kosong');
      return;
    }

    const headers = ['ID', 'Nama Barang', 'SKU', 'Kategori', 'Stok', 'Harga'];
    const rows = items.map((it) => [
      it.id,
      `"${it.name.replace(/"/g, '""')}"`,
      `"${it.sku}"`,
      `"${it.category?.name || ''}"`,
      it.stock,
      it.price,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventaris_barang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Berhasil mengexport ${items.length} barang ke file CSV!`, 'Backup CSV');
  };

  // Filtering & Sorting
  const filteredItems = items
    .filter((it) => {
      const matchSearch =
        it.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'stock_asc') return (Number(a.stock) || 0) - (Number(b.stock) || 0);
      if (sortBy === 'stock_desc') return (Number(b.stock) || 0) - (Number(a.stock) || 0);
      if (sortBy === 'price_asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price_desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
      return 0;
    });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Daftar Barang & Inventaris</h1>
            <p className="page-subtitle">
              Kelola katalog fisik, SKU, alokasi kategori, jumlah stok, dan nilai valuasi aset.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fetchData(true)}
              className="btn btn-ghost"
              title="Sinkronkan data dengan API"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              id="btn-export-csv"
              className="btn btn-ghost"
              title="Download backup CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              id="btn-add-item"
              className="btn btn-primary"
            >
              <Plus size={15} />
              <span>Tambah Barang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <div className="toolbar">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama barang atau kode SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          id="filter-category"
          className="filter-select"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="name_asc">Nama (A - Z)</option>
          <option value="name_desc">Nama (Z - A)</option>
          <option value="stock_asc">Stok Terendah</option>
          <option value="stock_desc">Stok Tertinggi</option>
          <option value="price_asc">Harga Termurah</option>
          <option value="price_desc">Harga Termahal</option>
        </select>
      </div>

      {/* Hairline Table */}
      <div className="table-wrap">
        <table className="inv-table">
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Barang & SKU</th>
              <th style={{ width: '18%' }}>Kategori</th>
              <th style={{ width: '16%' }}>Stok Fisik</th>
              <th style={{ width: '16%' }}>Harga Satuan</th>
              <th style={{ width: '14%' }}>Total Nilai</th>
              <th style={{ width: '8%', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Memuat data barang dari API...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <FolderOpen size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>
                    Tidak ada barang yang cocok
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
                    {searchQuery || selectedCategory
                      ? 'Silakan coba ubah kata kunci pencarian atau reset filter kategori.'
                      : 'Belum ada barang terdaftar. Klik "Tambah Barang" untuk memulai.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const stockNum = Number(item.stock) || 0;
                const priceNum = Number(item.price) || 0;
                const totalVal = stockNum * priceNum;

                let stockStatus = 'ok';
                let stockStatusText = 'Aman';
                if (stockNum <= 5) {
                  stockStatus = 'crit';
                  stockStatusText = 'Kritis';
                } else if (stockNum <= 10) {
                  stockStatus = 'low';
                  stockStatusText = 'Menipis';
                }

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>
                        {item.name}
                      </div>
                      <div className="mono" style={{ color: 'var(--kraft)', fontSize: '0.75rem', marginTop: '2px' }}>
                        {item.sku}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {item.category?.name || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="stock-indicator">
                        <span className={`stock-dot ${stockStatus}`} />
                        <span className="mono" style={{ fontWeight: 600 }}>
                          {stockNum} unit
                        </span>
                        <span className={`stock-label ${stockStatus}`} style={{ fontSize: '0.6875rem' }}>
                          ({stockStatusText})
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="mono">{formatIDR(priceNum)}</span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontWeight: 600 }}>
                        {formatIDR(totalVal)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="btn-icon edit"
                          title="Edit barang"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(item)}
                          className="btn-icon danger"
                          title="Hapus barang"
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
                <Package size={18} style={{ color: 'var(--kraft)' }} />
                <h3 className="slideover-title">
                  {slideoverMode === 'create' ? 'Tambah Barang Baru' : 'Edit Data Barang'}
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

            <form onSubmit={handleSubmitItem} style={{ display: 'contents' }} noValidate>
              <div className="slideover-body">
                {/* Honeypot anti-spam */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input
                    type="text"
                    name="_hp_item"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* Kategori */}
                <div className="form-group">
                  <label className="form-label" htmlFor="item-cat">
                    Kategori <span className="req">*</span>
                  </label>
                  <select
                    id="item-cat"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-select"
                  >
                    <option value="" disabled>
                      -- Pilih Kategori --
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category_id && (
                    <span className="form-error">{formErrors.category_id[0]}</span>
                  )}
                </div>

                {/* Nama Barang */}
                <div className="form-group">
                  <label className="form-label" htmlFor="item-name">
                    Nama Barang <span className="req">*</span>
                  </label>
                  <input
                    id="item-name"
                    type="text"
                    required
                    placeholder="Contoh: Meja Kayu Solid 120cm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                  {formErrors.name && (
                    <span className="form-error">{formErrors.name[0]}</span>
                  )}
                </div>

                {/* SKU + Generator button */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label className="form-label" htmlFor="item-sku">
                      Kode SKU <span className="req">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateSkuHelper}
                      className="btn-ghost"
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.6875rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--kraft)',
                        border: 'none',
                      }}
                    >
                      <Sparkles size={11} />
                      <span>Buat Otomatis</span>
                    </button>
                  </div>
                  <input
                    id="item-sku"
                    type="text"
                    required
                    placeholder="Contoh: MEJ-402"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="form-input mono-input"
                  />
                  {formErrors.sku && (
                    <span className="form-error">{formErrors.sku[0]}</span>
                  )}
                </div>

                {/* Stok & Harga Grid */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="item-stock">
                      Stok Fisik <span className="req">*</span>
                    </label>
                    <input
                      id="item-stock"
                      type="number"
                      min="0"
                      required
                      placeholder="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="form-input mono-input"
                    />
                    {formErrors.stock && (
                      <span className="form-error">{formErrors.stock[0]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="item-price">
                      Harga Satuan (IDR) <span className="req">*</span>
                    </label>
                    <input
                      id="item-price"
                      type="number"
                      min="0"
                      step="1000"
                      required
                      placeholder="150000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="form-input mono-input"
                    />
                    {formErrors.price && (
                      <span className="form-error">{formErrors.price[0]}</span>
                    )}
                  </div>
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
                  {formLoading ? 'Menyimpan...' : slideoverMode === 'create' ? 'Simpan Barang' : 'Perbarui Barang'}
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
                <h3 className="modal-title">Hapus Barang?</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>Tindakan ini permanen</p>
              </div>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Apakah Anda yakin ingin menghapus barang <strong>"{itemToDelete?.name}"</strong> (SKU: {itemToDelete?.sku})? Data yang sudah dihapus tidak dapat dipulihkan.
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

export default Items;
