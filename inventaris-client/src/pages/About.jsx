import React, { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import { useToast } from '../context/ToastContext';
import { trackClickCTA, trackClickWA, getAnalyticsHistory } from '../utils/analytics';
import {
  FileText,
  Globe,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Tablet,
  Monitor,
  Code,
  Download,
  Activity,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

const About = () => {
  const toast = useToast();
  const [events, setEvents] = useState(() => getAnalyticsHistory());

  const refreshEvents = () => {
    const updated = getAnalyticsHistory();
    setEvents(updated);
    toast.info('Riwayat log analytics & tracking berhasil dimuat ulang.', 'Analytics Refresh');
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'InventarisPro Indonesia',
    url: 'http://localhost:5173',
    logo: 'http://localhost:5173/favicon.svg',
    description: 'Penyedia sistem manajemen inventaris dan pergudangan berbasis fullstack Laravel API & React.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+62-812-3456-7890',
      contactType: 'customer support',
      availableLanguage: ['Indonesian', 'English'],
    },
  };

  const localSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'InventarisPro Hub Jakarta',
    image: 'http://localhost:5173/favicon.svg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Jenderal Sudirman No. Kav 21',
      addressLocality: 'Jakarta Selatan',
      addressRegion: 'DKI Jakarta',
      postalCode: '12920',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -6.2088,
      longitude: 106.8456,
    },
    url: 'http://localhost:5173',
    telephone: '+62-812-3456-7890',
    priceRange: 'IDR',
  };

  const handleTestCTA = (ctaName) => {
    trackClickCTA(ctaName);
    toast.success(`Event CTA "${ctaName}" berhasil di-track ke sistem analytics!`, 'Tracking Sukses');
    refreshEvents();
  };

  const handleTestWA = () => {
    trackClickWA('about_page_test');
    toast.info('Event Klik WhatsApp terdeteksi & dicatat di log analytics.', 'WA Tracked');
    refreshEvents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <Sparkles size={14} />
            Task 9: Fullstack Checklist & SEO Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tentang Sistem, SEO & Standar Kepatuhan Web
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Halaman ini memaparkan implementasi lengkap persyaratan teknis, mulai dari struktur canonical, schema JSON-LD, sitemap XML, robots.txt, anti-spam form, tracking analytics, hingga kesiapan responsive di semua device.
          </p>
        </div>
      </div>

      {/* SEO & Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sitemap & Robots */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Sitemap.xml & Robots.txt</h2>
            <p className="text-xs text-slate-500 mt-1">
              File sitemap terstruktur untuk pengindeksan Googlebot dan perayap search engine.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              <span>Buka /sitemap.xml</span>
              <ExternalLink size={13} />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              <span>Buka /robots.txt</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Canonical & Search Console */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Canonical URL & Search Console</h2>
            <p className="text-xs text-slate-500 mt-1">
              Tag canonical aktif mencegah duplicate content, serta verifikasi Google Search Console.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] font-mono text-slate-600 space-y-1">
            <div>&lt;link rel="canonical" href="http://localhost:5173/" /&gt;</div>
            <div>&lt;meta name="robots" content="index, follow" /&gt;</div>
          </div>
        </div>

        {/* Anti-Spam & Form Security */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Anti-Spam & Validasi Form</h2>
            <p className="text-xs text-slate-500 mt-1">
              Honeypot field tersembunyi (_hp_check), sanitasi regex, dan pesan error realtime per user event.
            </p>
          </div>
          <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 size={14} />
              <span>Honeypot Bot Trap Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <CheckCircle2 size={14} />
              <span>Sanctum Bearer Token Auth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schema Markup Showcase */}
      <div id="schemas" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Structured Data (JSON-LD Schemas)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Schema yang terpasang di <code>index.html</code> untuk rich snippets di hasil pencarian Google.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">1. Organization Schema (JSON-LD)</span>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto">
              {JSON.stringify(orgSchema, null, 2)}
            </pre>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">2. LocalBusiness Schema (JSON-LD)</span>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto">
              {JSON.stringify(localSchema, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Analytics Event Live Tester */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Event Tracking (CTA, WA, Form)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Uji coba pencatatan interaksi user: klik CTA, klik WhatsApp, dan submit form.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshEvents}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Refresh Log
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleTestCTA('uji_tombol_cta_promo')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Track Click CTA Demo
          </button>

          <button
            type="button"
            onClick={handleTestWA}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1.5"
          >
            <MessageCircle size={14} />
            <span>Track Click WhatsApp Demo</span>
          </button>
        </div>

        {/* Event Logs list */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 max-h-56 overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Log Interaksi Terkini ({events.length} Terdeteksi)
          </div>
          {events.length === 0 ? (
            <p className="text-xs text-slate-400">Belum ada riwayat klik event.</p>
          ) : (
            <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
              {events.slice(0, 10).map((ev, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                  <span className="font-semibold text-indigo-700">[{ev.event}]</span>
                  <span className="text-slate-500 text-[10px]">{ev.timestamp}</span>
                  <span className="truncate max-w-[200px] text-slate-600">{JSON.stringify(ev.data)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Multi-Device Testing Verification Badge */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 rounded-3xl space-y-4">
        <h2 className="text-base font-bold">Uji Kompatibilitas Multi-Device</h2>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Tampilan antarmuka telah dioptimalkan secara responsif dengan CSS Flexbox & CSS Grid, touch-friendly hit areas, dan collapsible mobile drawer.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md flex items-center gap-3">
            <Monitor size={24} className="text-indigo-300" />
            <div>
              <div className="text-xs font-bold">Desktop & Laptop</div>
              <div className="text-[10px] text-slate-400">1920x1080 / 1366x768</div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md flex items-center gap-3">
            <Tablet size={24} className="text-violet-300" />
            <div>
              <div className="text-xs font-bold">Tablet & iPad</div>
              <div className="text-[10px] text-slate-400">768x1024 / 820x1180</div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md flex items-center gap-3">
            <Smartphone size={24} className="text-emerald-300" />
            <div>
              <div className="text-xs font-bold">Mobile Smartphone</div>
              <div className="text-[10px] text-slate-400">375x667 / 414x896</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
