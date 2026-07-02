import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  IoGridOutline,
  IoReceiptOutline,
  IoWalletOutline,
  IoSparklesOutline,
  IoCalendarOutline,
  IoBarChartOutline,
  IoSettingsOutline,
  IoTrendingUpSharp
} from 'react-icons/io5';

export const Sidebar = () => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: IoGridOutline },
    { path: '/transactions', label: 'Transactions', icon: IoReceiptOutline },
    { path: '/budget', label: 'Budgets', icon: IoWalletOutline },
    { path: '/savings', label: 'Savings Goals', icon: IoSparklesOutline },
    { path: '/bills', label: 'Bill Reminders', icon: IoCalendarOutline },
    { path: '/reports', label: 'Reports & Analytics', icon: IoBarChartOutline },
    { path: '/settings', label: 'Settings', icon: IoSettingsOutline }
  ];

  return (
    <aside className="app-sidebar glass-panel">
      <div className="sidebar-brand">
        <div className="brand-logo-wrapper">
          <IoTrendingUpSharp className="brand-logo" />
        </div>
        <span className="brand-name">FinVault</span>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <Icon className="nav-item-icon" />
              <span className="nav-item-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <span className="footer-meta">Local Vault Persistent</span>
      </div>
    </aside>
  );
};

export default Sidebar;
