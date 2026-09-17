import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames = {
  '': 'Dashboard',
  'items': 'Data Barang',
  'categories': 'Kategori',
  'about': 'Tentang & SEO',
  'login': 'Masuk Akun',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Schema list elements for SEO
  const breadcrumbItems = [
    { name: 'Dashboard', path: '/' },
    ...pathnames.map((val, idx) => {
      const path = `/${pathnames.slice(0, idx + 1).join('/')}`;
      const name = routeNames[val] || val.charAt(0).toUpperCase() + val.slice(1);
      return { name, path };
    }),
  ];

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-nav">
      <ol className="breadcrumb-list" itemScope itemType="https://schema.org/BreadcrumbList">
        <li
          className="breadcrumb-item"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link to="/" className="breadcrumb-link" itemProp="item">
            <Home size={15} className="breadcrumb-icon" />
            <span itemProp="name">Dashboard</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = routeNames[name] || name;

          return (
            <li
              key={routeTo}
              className="breadcrumb-item"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <ChevronRight size={14} className="breadcrumb-separator" aria-hidden="true" />
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page" itemProp="name">
                  {displayName}
                </span>
              ) : (
                <Link to={routeTo} className="breadcrumb-link" itemProp="item">
                  <span itemProp="name">{displayName}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(index + 2)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
