import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, LayoutDashboard, Package, Tags, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Boxes size={16} />
        </div>
        <div>
          <div className="sidebar-logo-text">Inventaris</div>
          <div className="sidebar-logo-sub">Sistem Manajemen</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Menu</div>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <LayoutDashboard size={15} />
            Dashboard
          </NavLink>

          <NavLink
            to="/items"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Package size={15} />
            Barang
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Tags size={15} />
            Kategori
          </NavLink>
        </nav>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* User info */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Administrator'}</div>
            <div className="sidebar-user-email">{user?.email || ''}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link"
          style={{ color: 'var(--danger)', width: '100%' }}
        >
          <LogOut size={15} />
          Keluar (Logout)
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
