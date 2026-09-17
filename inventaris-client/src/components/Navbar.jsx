import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { trackClickWA, trackClickCTA } from '../utils/analytics';
import {
  Boxes,
  LayoutDashboard,
  Package,
  Tags,
  Info,
  LogOut,
  User,
  MessageCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleWhatsAppClick = (e) => {
    trackClickWA('navbar_cta');
    toast.info('Menghubungkan ke layanan WhatsApp Customer Care...', 'Buka WhatsApp');
  };

  const handleNavClick = (label) => {
    trackClickCTA(`nav_${label}`);
    setMobileMenuOpen(false);
  };

  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Halo Admin Inventaris Pro, saya memerlukan bantuan terkait sistem inventaris.'
  )}`;

  return (
    <header className="navbar-wrapper sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 font-bold text-xl text-slate-800 hover:text-indigo-600 transition-colors"
              onClick={() => handleNavClick('logo')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Boxes size={22} />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight tracking-tight">Inventaris<span className="text-indigo-600">Pro</span></span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Laravel + React API</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
              onClick={() => handleNavClick('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/items"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                  onClick={() => handleNavClick('items')}
                >
                  <Package size={18} />
                  <span>Data Barang</span>
                </NavLink>

                <NavLink
                  to="/categories"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                  onClick={() => handleNavClick('categories')}
                >
                  <Tags size={18} />
                  <span>Kategori</span>
                </NavLink>
              </>
            )}

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
              onClick={() => handleNavClick('about')}
            >
              <Info size={18} />
              <span>Tentang & SEO</span>
            </NavLink>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* WhatsApp CTA */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              id="cta-whatsapp-nav"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-sm"
              title="Hubungi Admin via WhatsApp"
            >
              <MessageCircle size={15} className="text-emerald-600" />
              <span>Chat WhatsApp</span>
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      {user?.email || 'authenticated'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-logout"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                  title="Keluar dari akun"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                id="btn-login-nav"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
              >
                <span>Masuk Akun</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50"
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl animate-fade-in">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
            }
            onClick={() => handleNavClick('dashboard_mobile')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink
                to="/items"
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
                }
                onClick={() => handleNavClick('items_mobile')}
              >
                <Package size={18} />
                <span>Data Barang</span>
              </NavLink>

              <NavLink
                to="/categories"
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
                }
                onClick={() => handleNavClick('categories_mobile')}
              >
                <Tags size={18} />
                <span>Kategori</span>
              </NavLink>
            </>
          )}

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
            }
            onClick={() => handleNavClick('about_mobile')}
          >
            <Info size={18} />
            <span>Tentang & SEO</span>
          </NavLink>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">{user?.name}</p>
                    <p className="text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 py-1.5 px-3 rounded-lg hover:bg-rose-50"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow"
                onClick={() => setMobileMenuOpen(false)}
              >
                Masuk Akun
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
