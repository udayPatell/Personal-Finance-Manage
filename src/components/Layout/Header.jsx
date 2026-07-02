import React, { useState, useRef, useEffect } from 'react';
import { IoSunnyOutline, IoMoonOutline, IoNotificationsOutline, IoClose } from 'react-icons/io5';
import { useFinance } from '../../context/FinanceContext';
import { useNotifications } from '../../hooks/useNotifications';
import { format } from 'date-fns';
import Button from '../common/Button';
import Card from '../common/Card';

export const Header = () => {
  const { theme, toggleTheme, currency } = useFinance();
  const notifications = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Format today's date
  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');

  // Count notifications
  const notificationCount = notifications.length;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showDropdown]);

  return (
    <header className="app-header glass-panel">
      <div className="header-left">
        <h2 className="header-welcome">Hello User</h2>
        <p className="header-date">{todayFormatted}</p>
      </div>

      <div className="header-right">
        {/* Currency Display Badge */}
        <div className="header-currency-badge">
          Active: {currency.code} ({currency.symbol})
        </div>

        {/* Theme Toggle */}
        <Button
          variant="secondary"
          size="sm"
          className="header-action-btn"
          onClick={toggleTheme}
          icon={theme === 'dark' ? IoSunnyOutline : IoMoonOutline}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        />

        {/* Notification Bell */}
        <div className="header-notification-wrapper" ref={dropdownRef}>
          <Button
            variant="secondary"
            size="sm"
            className={`header-action-btn ${notificationCount > 0 ? 'animate-pulse-slow' : ''}`}
            onClick={() => setShowDropdown(!showDropdown)}
            icon={IoNotificationsOutline}
          />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}

          {/* Notifications Dropdown */}
          {showDropdown && (
            <Card className="notification-dropdown">
              <div className="dropdown-header">
                <span className="dropdown-title">System Alerts ({notificationCount})</span>
                {notificationCount > 0 && (
                  <span className="dropdown-subtitle">Actions required</span>
                )}
              </div>
              <div className="dropdown-body">
                {notificationCount === 0 ? (
                  <div className="dropdown-empty">
                    <p className="dropdown-empty-text">All quiet! No pending alerts.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`dropdown-item alert-border-${notif.severity}`}>
                      <div className="item-details">
                        <span className={`item-title notif-severity-${notif.severity}`}>
                          {notif.title}
                        </span>
                        <p className="item-desc">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
