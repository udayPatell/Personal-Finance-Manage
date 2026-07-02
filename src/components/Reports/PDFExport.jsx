import React, { useState } from 'react';
import { generatePDFReport } from '../../utils/pdfGenerator';
import { useFinance } from '../../context/FinanceContext';
import Button from '../common/Button';
import { IoDownloadOutline } from 'react-icons/io5';

export const PDFExport = ({ filteredTransactions, filters, summary }) => {
  const { currency, showToast } = useFinance();
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    showToast('Compiling your PDF statement...', 'info');
    
    // Slight timeout to let the UI update and allow the toast to pop
    setTimeout(() => {
      try {
        generatePDFReport({
          transactions: filteredTransactions,
          currency,
          filters,
          summary
        });
        showToast('PDF report downloaded successfully!', 'success');
      } catch (e) {
        console.error(e);
        showToast('Failed to export PDF statement', 'error');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <Button
      variant="success"
      size="md"
      onClick={handleExport}
      disabled={loading}
      icon={IoDownloadOutline}
    >
      {loading ? 'Exporting PDF...' : 'Download PDF Statement'}
    </Button>
  );
};

export default PDFExport;
