import React from 'react';
import { Link } from 'react-router-dom';
import { Boxes, ShieldCheck, Heart, ExternalLink, MessageCircle, FileText, Globe } from 'lucide-react';
import { trackClickWA, trackClickCTA } from '../utils/analytics';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const toast = useToast();
  const currentYear = new Date().getFullYear();

  const handleWa = () => {
    trackClickWA('footer_cta');
    toast.info('Menghubungkan ke layanan WhatsApp Customer Care...', 'Buka WhatsApp');
  };

  const handleLinkClick = (name) => {
    trackClickCTA(`footer_${name}`);
  };

  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Halo Tim Inventaris Pro, saya ingin konsultasi sistem inventaris.'
  )}`;

  return (
    <footer className="footer-section bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
                <Boxes size={20} />
              </div>
              <span className="font-bold text-lg text-white">
                Inventaris<span className="text-indigo-400">Pro</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem manajemen inventaris terintegrasi fullstack berbasis Laravel Sanctum API dan React Vite SPA. Solusi cepat, aman, dan responsif untuk pencatatan barang dan kategori bisnis.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck size={16} />
              <span>Sanctum Bearer Protected</span>
            </div>
          </div>

          {/* Internal Links: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Navigasi Utama</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" onClick={() => handleLinkClick('dashboard')} className="hover:text-white transition">
                  Dashboard Ringkasan
                </Link>
              </li>
              <li>
                <Link to="/items" onClick={() => handleLinkClick('items')} className="hover:text-white transition">
                  Manajemen Barang (Items)
                </Link>
              </li>
              <li>
                <Link to="/categories" onClick={() => handleLinkClick('categories')} className="hover:text-white transition">
                  Manajemen Kategori
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={() => handleLinkClick('about')} className="hover:text-white transition">
                  Profil & SEO Metadata
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical & SEO Assets */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">SEO & Arsitektur</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick('sitemap_xml')}
                  className="flex items-center gap-1.5 hover:text-indigo-400 transition"
                >
                  <FileText size={13} />
                  <span>Sitemap XML (Canonical)</span>
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick('robots_txt')}
                  className="flex items-center gap-1.5 hover:text-indigo-400 transition"
                >
                  <Globe size={13} />
                  <span>Robots.txt Engine File</span>
                </a>
              </li>
              <li>
                <Link to="/about#schemas" onClick={() => handleLinkClick('schemas')} className="hover:text-white transition">
                  Schema Organization & Local
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  Laravel 12 API + Sanctum
                </span>
              </li>
            </ul>
          </div>

          {/* Support & Contact CTA */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Layanan Dukungan</h4>
            <p className="text-xs text-slate-400">
              Butuh integrasi API khusus atau pelaporan kendala inventaris? Hubungi tim teknis via WhatsApp kami.
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWa}
              id="cta-whatsapp-footer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md w-full justify-center"
            >
              <MessageCircle size={16} />
              <span>Hubungi CS WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} InventarisPro Fullstack SPA. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">Task 9 - Magang Fullstack</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span className="text-[11px] text-emerald-400 font-medium">CORS: Enabled (Port 5173 & 8000)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
