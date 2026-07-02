import React, { useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CURRENCIES } from '../utils/constants';
import { CategoryManager } from '../components/Categories/CategoryManager';
import { IoDownloadOutline, IoCloudUploadOutline, IoRefreshOutline, IoSettingsOutline, IoBrushOutline, IoPricetagOutline } from 'react-icons/io5';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export const SettingsPage = () => {
  const {
    currency,
    changeCurrency,
    theme,
    toggleTheme,
    resetData,
    importData,
    categories,
    transactions,
    budgets,
    savingsGoals,
    bills,
    showToast
  } = useFinance();

  const fileInputRef = useRef(null);

  // Backup Export
  const handleExportBackup = () => {
    try {
      const backupObj = {
        categories,
        transactions,
        budgets,
        savingsGoals,
        bills,
        currency,
        theme
      };

      const jsonStr = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FinVault_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      showToast('Backup downloaded successfully', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to export backup data', 'error');
    }
  };

  // Backup Import
  const handleImportSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Simple verification check
        if (!parsed.categories || !parsed.transactions) {
          showToast('Invalid backup file structure', 'error');
          return;
        }

        const success = importData(parsed);
        if (success) {
          showToast('Data imported successfully!', 'success');
        } else {
          showToast('Failed to parse backup structures', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Error reading backup file', 'error');
      }
    };
    reader.readAsText(file);
    
    // Clear selection
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    const confirmMsg = 'WARNING: This will wipe all transactions, budgets, goals, bills, and custom category lists. You will lose all locally stored financial history. This action CANNOT be undone. Proceed?';
    if (window.confirm(confirmMsg)) {
      resetData();
      showToast('Application reset to factory defaults', 'warning');
    }
  };

  return (
    <div className="settings-page flex-column gap-lg">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure application settings, currencies, and manage local backups.</p>
      </div>

      {/* Main Settings Grid */}
      <div className="settings-options-grid grid-2-columns gap-lg">
        {/* General Options */}
        <Card className="settings-card flex-column gap-md">
          <h3 className="chart-card-title flex-center gap-sm">
            <IoSettingsOutline /> Preferences
          </h3>

          {/* Currency Select */}
          <div className="form-group flex-between">
            <div className="label-description flex-column">
              <span className="setting-label-bold font-bold">Base Currency</span>
              <span className="setting-desc text-muted text-xs">Used across all summaries, charts and tables</span>
            </div>
            <select
              value={currency.code}
              onChange={(e) => changeCurrency(e.target.value)}
              className="form-select settings-select"
            >
              {CURRENCIES.map((cur) => (
                <option key={cur.code} value={cur.code}>
                  {cur.name} ({cur.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="settings-divider"></div>

          {/* Theme select */}
          <div className="form-group flex-between">
            <div className="label-description flex-column">
              <span className="setting-label-bold font-bold">Visual Theme</span>
              <span className="setting-desc text-muted text-xs">Toggle between dark-glass and light-glass UI views</span>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </Card>

        {/* Data Management Options */}
        <Card className="settings-card flex-column gap-md">
          <h3 className="chart-card-title flex-center gap-sm">
            <IoBrushOutline /> Data Operations
          </h3>

          {/* Import/Export */}
          <div className="form-group flex-between align-start">
            <div className="label-description flex-column">
              <span className="setting-label-bold font-bold">Local JSON Backups</span>
              <span className="setting-desc text-muted text-xs">Save your data locally or restore a previous vault backup</span>
            </div>
            <div className="settings-backup-buttons flex-column gap-sm">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportBackup}
                icon={IoDownloadOutline}
                className="w-100"
              >
                Export Backup
              </Button>
              <label className="btn btn-secondary btn-sm cursor-pointer w-100">
                <IoCloudUploadOutline /> Import Backup
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImportSelect}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div className="settings-divider"></div>

          {/* Wipe Storage */}
          <div className="form-group flex-between">
            <div className="label-description flex-column">
              <span className="setting-label-bold font-bold text-danger">Wipe Application Data</span>
              <span className="setting-desc text-muted text-xs">Permanently delete all stored categories and transactions</span>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReset}
              icon={IoRefreshOutline}
            >
              Reset Application
            </Button>
          </div>
        </Card>
      </div>

      <div className="settings-divider"></div>

      {/* Category Manager component */}
      <div className="settings-category-manager flex-column gap-md">
        <h3 className="chart-card-title flex-center gap-sm" style={{ marginBottom: 0 }}>
          <IoPricetagOutline /> Category Manager
        </h3>
        <p className="page-subtitle" style={{ marginTop: '-0.5rem' }}>
          Create and color custom transaction tags.
        </p>
        <CategoryManager />
      </div>
    </div>
  );
};

export default SettingsPage;
