import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './helpers';

/**
 * Generates and downloads a formatted PDF report.
 */
export const generatePDFReport = ({
  transactions,
  currency,
  filters,
  summary
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Theme colors
  const primaryColor = [124, 58, 237]; // Electric Violet #7C3AED
  const accentGreen = [16, 185, 129]; // Emerald Green
  const accentRed = [244, 63, 94]; // Rose Red
  const darkTextColor = [31, 41, 55]; // Charcoal

  // Header Banner
  doc.setFillColor(15, 15, 26); // deep dark blue background
  doc.rect(0, 0, 210, 35, 'F');

  // Title text in Banner
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('FinVault', 14, 18);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text('Personal Finance Summary Report', 14, 26);

  // Timestamp & Meta info
  const todayStr = formatDate(new Date().toISOString().split('T')[0], 'yyyy-MM-dd HH:mm');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Generated: ${todayStr}`, 145, 18);

  const startLabel = filters.startDate ? formatDate(filters.startDate, 'yyyy-MM-dd') : 'Earliest';
  const endLabel = filters.endDate ? formatDate(filters.endDate, 'yyyy-MM-dd') : 'Latest';
  doc.text(`Period: ${startLabel} to ${endLabel}`, 145, 24);

  // Reset text color for body
  doc.setTextColor(...darkTextColor);

  // --- SECTION 1: FINANCIAL OVERVIEW SUMMARY ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('1. Financial Cash Flow Overview', 14, 48);

  // Summary Grid details
  doc.autoTable({
    startY: 52,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { font: 'Helvetica', fontSize: 9 },
    head: [['Metrics Description', 'Value']],
    body: [
      ['Total Recorded Income', formatCurrency(summary.totalIncome, currency.code, currency.symbol)],
      ['Total Recorded Expenses', formatCurrency(summary.totalExpenses, currency.code, currency.symbol)],
      ['Net Savings / Cashflow Balance', formatCurrency(summary.netBalance, currency.code, currency.symbol)],
      ['Savings Goal Contribution Transfers', formatCurrency(summary.savingsContribution, currency.code, currency.symbol)]
    ],
    columnStyles: {
      1: { fontStyle: 'bold', halign: 'right' }
    }
  });

  // --- SECTION 2: CATEGORY BREAKDOWN ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('2. Spending by Categories', 14, doc.lastAutoTable.finalY + 12);

  // Calculate expense category aggregates from report transactions list
  const expensesList = transactions.filter((tx) => tx.type === 'expense');
  const catSums = expensesList.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const categoryRows = Object.keys(catSums).map((catName) => {
    const totalSpent = catSums[catName];
    const pct = summary.totalExpenses > 0 ? ((totalSpent / summary.totalExpenses) * 100).toFixed(1) : '0.0';
    return [
      catName,
      formatCurrency(totalSpent, currency.code, currency.symbol),
      `${pct}%`
    ];
  }).sort((a, b) => parseFloat(b[1].replace(/[^0-9.-]/g, '')) - parseFloat(a[1].replace(/[^0-9.-]/g, '')));

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 16,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    headStyles: { fillColor: [55, 65, 81], textColor: [255, 255, 255] },
    styles: { font: 'Helvetica', fontSize: 9 },
    head: [['Category Name', 'Total Amount Spent', 'Percentage of Expenses']],
    body: categoryRows.length > 0 ? categoryRows : [['No Expense Logs Found', formatCurrency(0, currency.code, currency.symbol), '0%']],
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' }
    }
  });

  // --- SECTION 3: RECENT TRANSACTION DETAIL LOG ---
  doc.addPage(); // Add to page 2 for transactions detail

  // Header Banner Page 2
  doc.setFillColor(15, 15, 26);
  doc.rect(0, 0, 210, 15, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('FinVault Ledger Statement Detail', 14, 10);

  doc.setTextColor(...darkTextColor);
  doc.setFontSize(13);
  doc.text('3. Recorded Transactions Ledger', 14, 25);

  const transactionRows = transactions.map((tx) => [
    formatDate(tx.date, 'yyyy-MM-dd'),
    tx.category,
    tx.description || 'None',
    tx.paymentMethod,
    tx.type.toUpperCase(),
    `${tx.type === 'income' ? '+' : '-'} ${formatCurrency(tx.amount, currency.code, currency.symbol)}`
  ]);

  doc.autoTable({
    startY: 29,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    styles: { font: 'Helvetica', fontSize: 8.5 },
    head: [['Date', 'Category', 'Description', 'Method', 'Type', 'Amount']],
    body: transactionRows.length > 0 ? transactionRows : [['No records matching selected filters found.', '', '', '', '', '']],
    columnStyles: {
      4: { fontStyle: 'bold' },
      5: { fontStyle: 'bold', halign: 'right' }
    },
    // Color amount fields green/red in PDF
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const text = data.cell.text[0];
        if (text && text.startsWith('+')) {
          doc.setTextColor(...accentGreen);
        } else if (text && text.startsWith('-')) {
          doc.setTextColor(...accentRed);
        }
      }
    }
  });

  // Footer page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Page ${i} of ${pageCount}`, 180, 287);
  }

  // Trigger Save/Download
  doc.save(`FinVault_Report_${startLabel}_to_${endLabel}.pdf`);
};
export default generatePDFReport;
