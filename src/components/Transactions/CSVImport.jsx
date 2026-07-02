import React, { useState } from 'react';
import { parseCSV, checkDuplicate } from '../../utils/csvParser';
import { useFinance } from '../../context/FinanceContext';
import { PAYMENT_METHODS } from '../../utils/constants';

import { formatCurrency } from '../../utils/helpers';
import { IoCloudUploadOutline, IoListOutline, IoCheckmarkCircle, IoAlertCircle, IoWarning } from 'react-icons/io5';
import Button from '../common/Button';
import Card from '../common/Card';

export const CSVImport = ({ onImportComplete }) => {
  const { transactions, categories, addBulkTransactions, currency, showToast } = useFinance();

  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Preview
  const [csvRows, setCsvRows] = useState([]);
  const [fileName, setFileName] = useState('');

  // Header options from parsed CSV
  const [headers, setHeaders] = useState([]);

  // Mapping states (stores column index)
  const [mappings, setMappings] = useState({
    dateCol: '',
    amountCol: '',
    descCol: '',
    typeCol: '', // optional
    categoryCol: '' // optional
  });

  // Default values for missing columns
  const [defaultCategory, setDefaultCategory] = useState('Other');
  const [defaultPayment, setDefaultPayment] = useState(PAYMENT_METHODS[0]);
  const [defaultType, setDefaultType] = useState('expense');

  // Preview List
  const [mappedTransactions, setMappedTransactions] = useState([]);

  // File Drag-Drop Event Handlers
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      showToast('Please select a valid CSV file', 'error');
      return;
    }

    try {
      setFileName(file.name);
      const parsedData = await parseCSV(file);
      if (parsedData.length === 0) {
        showToast('CSV file is empty', 'error');
        return;
      }

      setCsvRows(parsedData);
      
      // Assume first row is headers if elements contain non-numeric data
      const firstRow = parsedData[0];
      setHeaders(firstRow.map((col, index) => ({ name: col || `Column ${index + 1}`, index })));

      // Auto-assign some heuristic mappings
      const guessMapping = { dateCol: '', amountCol: '', descCol: '', typeCol: '', categoryCol: '' };
      firstRow.forEach((colName, idx) => {
        const nameLower = (colName || '').toLowerCase();
        if (nameLower.includes('date') || nameLower.includes('time')) guessMapping.dateCol = idx;
        else if (nameLower.includes('amount') || nameLower.includes('value') || nameLower.includes('price')) guessMapping.amountCol = idx;
        else if (nameLower.includes('desc') || nameLower.includes('particulars') || nameLower.includes('info') || nameLower.includes('trans')) guessMapping.descCol = idx;
        else if (nameLower.includes('type') || nameLower.includes('mode')) guessMapping.typeCol = idx;
        else if (nameLower.includes('cat')) guessMapping.categoryCol = idx;
      });

      // Set guessed or first columns
      setMappings({
        dateCol: guessMapping.dateCol !== '' ? guessMapping.dateCol : 0,
        amountCol: guessMapping.amountCol !== '' ? guessMapping.amountCol : 1,
        descCol: guessMapping.descCol !== '' ? guessMapping.descCol : 2,
        typeCol: guessMapping.typeCol !== '' ? guessMapping.typeCol : '',
        categoryCol: guessMapping.categoryCol !== '' ? guessMapping.categoryCol : ''
      });

      setStep(2);
    } catch (error) {
      console.error(error);
      showToast('Error parsing file', 'error');
    }
  };

  // Convert raw rows to items list using active mapping
  const generatePreview = () => {
    if (mappings.dateCol === '' || mappings.amountCol === '' || mappings.descCol === '') {
      showToast('Please map Date, Amount and Description fields', 'warning');
      return;
    }

    // Skip first header row
    const dataRows = csvRows.slice(1);
    
    const mapped = dataRows.map((row, index) => {
      const rawDate = row[mappings.dateCol] || '';
      const rawAmountStr = (row[mappings.amountCol] || '0').replace(/[^0-9.-]/g, '');
      const rawAmount = parseFloat(rawAmountStr) || 0;
      
      const rawDesc = row[mappings.descCol] || '';
      
      let rawType = defaultType;
      if (mappings.typeCol !== '') {
        const typeVal = (row[mappings.typeCol] || '').toLowerCase();
        if (typeVal.includes('inc') || typeVal.includes('credit') || typeVal.includes('deposit')) {
          rawType = 'income';
        } else {
          rawType = 'expense';
        }
      } else if (rawAmount > 0 && defaultType === 'expense') {
        // If amount is positive but header says expense, or default is expense, keep it.
        // Some statements represent income as positive, expenses as negative.
        if (parseFloat(rawAmountStr) < 0) {
          rawType = 'expense';
        }
      }

      // Convert negative values to positive magnitudes
      const finalAmount = Math.abs(rawAmount);

      let rawCat = defaultCategory;
      if (mappings.categoryCol !== '') {
        const catVal = row[mappings.categoryCol] || '';
        const found = categories.find(c => c.name.toLowerCase() === catVal.toLowerCase());
        if (found) rawCat = found.name;
      }

      const txObject = {
        type: rawType,
        amount: finalAmount,
        category: rawCat,
        description: rawDesc,
        date: formatDateString(rawDate),
        paymentMethod: defaultPayment,
        createdAt: Date.now() + index // separate timestamps
      };

      const isDuplicate = checkDuplicate(txObject, transactions);

      return {
        ...txObject,
        isDuplicate,
        id: `csv-${index}-${Date.now()}`
      };
    });

    setMappedTransactions(mapped);
    setStep(3);
  };

  // Try to parse Date from various typical string formats
  const formatDateString = (dateStr) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    try {
      // Replace slashes with dashes, split
      const parts = dateStr.replace(/\//g, '-').split('-');
      if (parts.length === 3) {
        // Check if YYYY-MM-DD
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
        // Check if DD-MM-YYYY
        if (parts[2].length === 4) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      // If it's a timestamp
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch {
      // Ignore date formatting errors and fall back to default
    }
    
    // Default fallback to today
    return new Date().toISOString().split('T')[0];
  };

  const handleImport = () => {
    if (mappedTransactions.length === 0) return;
    
    // Exclude duplicates or import anyway
    addBulkTransactions(mappedTransactions);
    showToast(`Successfully imported ${mappedTransactions.length} transactions!`, 'success');
    
    // Reset steps
    setStep(1);
    setCsvRows([]);
    setFileName('');
    setMappedTransactions([]);
    if (onImportComplete) onImportComplete();
  };

  return (
    <div className="csv-import-wizard">
      {/* Step 1: Upload */}
      {step === 1 && (
        <div
          className={`csv-dropzone glass-panel flex-center flex-column ${
            isDragOver ? 'drag-over' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
        >
          <IoCloudUploadOutline className="upload-icon" />
          <h4 className="upload-title">Drag & Drop Bank Statement</h4>
          <p className="upload-subtitle text-muted">Supports CSV file formats</p>
          <span className="upload-divider">or</span>
          <label className="btn btn-primary btn-md cursor-pointer">
            Browse File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      {/* Step 2: Mapping Configuration */}
      {step === 2 && (
        <Card className="csv-mapping-card flex-column gap-md">
          <div className="card-heading flex-between">
            <h3 className="chart-card-title">Map CSV Columns</h3>
            <span className="file-indicator text-muted">File: {fileName}</span>
          </div>

          <p className="mapping-description text-secondary">
            Select the matching column indices from your CSV sheet matching our required fields below.
          </p>

          <div className="mapping-grid">
            {/* Date */}
            <div className="form-group">
              <label className="form-label">Date Column *</label>
              <select
                value={mappings.dateCol}
                onChange={(e) => setMappings({ ...mappings, dateCol: parseInt(e.target.value) })}
                className="form-select"
              >
                {headers.map((h) => (
                  <option key={h.index} value={h.index}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount Column *</label>
              <select
                value={mappings.amountCol}
                onChange={(e) => setMappings({ ...mappings, amountCol: parseInt(e.target.value) })}
                className="form-select"
              >
                {headers.map((h) => (
                  <option key={h.index} value={h.index}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description Column *</label>
              <select
                value={mappings.descCol}
                onChange={(e) => setMappings({ ...mappings, descCol: parseInt(e.target.value) })}
                className="form-select"
              >
                {headers.map((h) => (
                  <option key={h.index} value={h.index}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="form-group">
              <label className="form-label">Type Column (Optional)</label>
              <select
                value={mappings.typeCol}
                onChange={(e) =>
                  setMappings({
                    ...mappings,
                    typeCol: e.target.value === '' ? '' : parseInt(e.target.value)
                  })
                }
                className="form-select"
              >
                <option value="">-- Don't Map (Use Default) --</option>
                {headers.map((h) => (
                  <option key={h.index} value={h.index}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mapping-divider"></div>

          <h4 className="section-subtitle">Fallback Defaults</h4>
          <div className="mapping-grid grid-3">
            {/* Default Category */}
            <div className="form-group">
              <label className="form-label">Default Category</label>
              <select
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value)}
                className="form-select"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Payment */}
            <div className="form-group">
              <label className="form-label">Default Payment Method</label>
              <select
                value={defaultPayment}
                onChange={(e) => setDefaultPayment(e.target.value)}
                className="form-select"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Type */}
            {mappings.typeCol === '' && (
              <div className="form-group">
                <label className="form-label">Default Type</label>
                <select
                  value={defaultType}
                  onChange={(e) => setDefaultType(e.target.value)}
                  className="form-select"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-actions flex-between">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="primary" onClick={generatePreview}>
              Generate Preview
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Preview list & validation */}
      {step === 3 && (
        <Card className="csv-preview-card flex-column gap-md">
          <div className="card-heading flex-between">
            <h3 className="chart-card-title">Statement Preview</h3>
            <span className="file-indicator text-muted">
              Parsed {mappedTransactions.length} records
            </span>
          </div>

          <p className="mapping-description text-secondary">
            Preview the converted transaction rows. Alerts mark duplicate transactions matching values already recorded.
          </p>

          <div className="table-container preview-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mappedTransactions.map((tx, idx) => (
                  <tr key={tx.id || idx}>
                    <td className="font-mono">{tx.date}</td>
                    <td>{tx.category}</td>
                    <td className="table-cell-desc" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className={`font-mono font-bold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency.code, currency.symbol)}
                    </td>
                    <td>
                      {tx.isDuplicate ? (
                        <span className="badge badge-warning flex-center gap-sm">
                          <IoWarning /> Duplicate
                        </span>
                      ) : (
                        <span className="badge badge-income flex-center gap-sm">
                          <IoCheckmarkCircle /> Clean
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-actions flex-between">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back to Map
            </Button>
            <Button variant="success" onClick={handleImport}>
              Import All Records
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CSVImport;
