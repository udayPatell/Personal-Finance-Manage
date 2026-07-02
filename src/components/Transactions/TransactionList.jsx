import React, { useState, useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { IoSearchOutline, IoTrashOutline, IoCreateOutline, IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';
import TransactionForm from './TransactionForm';
import EmptyState from '../common/EmptyState';

export const TransactionList = () => {
  const {
    filteredTransactions,
    filters,
    updateFilters,
    resetFilters,
    deleteTransaction,
    bulkDeleteTransactions
  } = useTransactions();

  const { categories, currency, showToast } = useFinance();

  // Selected state for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Editing state
  const [editingTx, setEditingTx] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters change
  const totalCount = filteredTransactions.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedTransactions.map((tx) => tx.id);
      setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
    } else {
      const pageIds = paginatedTransactions.map((tx) => tx.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected transactions?`)) {
      bulkDeleteTransactions(selectedIds);
      setSelectedIds([]);
      showToast('Selected transactions deleted', 'success');
      setCurrentPage(1);
    }
  };

  const handleDeleteOne = (id) => {
    if (window.confirm('Delete this transaction?')) {
      deleteTransaction(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      showToast('Transaction deleted', 'success');
    }
  };

  const getCategoryColor = (catName) => {
    const found = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    return found ? found.color : '#6B7280';
  };

  // Toggle sort order
  const handleSort = (field) => {
    const isCurrent = filters.sortBy === field;
    updateFilters({
      sortBy: field,
      sortOrder: isCurrent && filters.sortOrder === 'desc' ? 'asc' : 'desc'
    });
    setCurrentPage(1);
  };

  return (
    <div className="transaction-list-section flex-column gap-md">
      {/* Search & Quick Filters Bar */}
      <Card className="filter-controls-card">
        <div className="search-filters-row">
          <div className="search-input-wrapper">
            <IoSearchOutline className="search-icon" />
            <input
              type="text"
              placeholder="Search desc or category..."
              value={filters.search}
              onChange={(e) => {
                updateFilters({ search: e.target.value });
                setCurrentPage(1);
              }}
              className="form-input search-input"
            />
          </div>

          <div className="filter-selects">
            <select
              value={filters.type}
              onChange={(e) => {
                updateFilters({ type: e.target.value });
                setCurrentPage(1);
              }}
              className="form-select filter-select"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => {
                updateFilters({ category: e.target.value });
                setCurrentPage(1);
              }}
              className="form-select filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date and Amount Ranges (Collapsible or secondary row) */}
        <div className="secondary-filters-row flex-between gap-md">
          <div className="date-pickers flex-center gap-sm">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                updateFilters({ startDate: e.target.value });
                setCurrentPage(1);
              }}
              className="form-input date-input"
              title="Start Date"
            />
            <span className="filter-divider">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                updateFilters({ endDate: e.target.value });
                setCurrentPage(1);
              }}
              className="form-input date-input"
              title="End Date"
            />
          </div>

          <div className="amount-range flex-center gap-sm">
            <input
              type="number"
              placeholder="Min amount"
              value={filters.minAmount}
              onChange={(e) => {
                updateFilters({ minAmount: e.target.value });
                setCurrentPage(1);
              }}
              className="form-input amount-range-input"
            />
            <span className="filter-divider">-</span>
            <input
              type="number"
              placeholder="Max amount"
              value={filters.maxAmount}
              onChange={(e) => {
                updateFilters({ maxAmount: e.target.value });
                setCurrentPage(1);
              }}
              className="form-input amount-range-input"
            />
          </div>

          <Button variant="secondary" size="sm" onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Bulk action action banner */}
      {selectedIds.length > 0 && (
        <Card className="bulk-actions-banner flex-between">
          <span className="bulk-actions-text">
            <strong>{selectedIds.length}</strong> transaction(s) selected
          </span>
          <Button variant="danger" size="sm" onClick={handleBulkDelete} icon={IoTrashOutline}>
            Delete Selected
          </Button>
        </Card>
      )}

      {/* Transactions Grid/Table */}
      {totalCount === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description="Adjust your search filters or record a new transaction to populate the table."
        />
      ) : (
        <Card className="table-card overflow-hidden">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      className="glass-checkbox"
                      checked={
                        paginatedTransactions.length > 0 &&
                        paginatedTransactions.every((tx) => selectedIds.includes(tx.id))
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('date')} 
                    className="sortable-header"
                  >
                    Date {filters.sortBy === 'date' && (filters.sortOrder === 'desc' ? '▼' : '▲')}
                  </th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Method</th>
                  <th 
                    onClick={() => handleSort('amount')} 
                    className="sortable-header text-right"
                  >
                    Amount {filters.sortBy === 'amount' && (filters.sortOrder === 'desc' ? '▼' : '▲')}
                  </th>
                  <th style={{ width: '90px' }} className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((tx) => {
                  const isSelected = selectedIds.includes(tx.id);
                  const isIncome = tx.type === 'income';
                  const catColor = getCategoryColor(tx.category);

                  return (
                    <tr key={tx.id} className={isSelected ? 'row-selected' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          className="glass-checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(tx.id, e.target.checked)}
                        />
                      </td>
                      <td className="font-mono text-nowrap">{formatDate(tx.date, 'MMM dd, yyyy')}</td>
                      <td>
                        <span className="table-cat-badge" style={{ borderColor: `${catColor}33` }}>
                          <span className="cat-color-dot" style={{ backgroundColor: catColor }}></span>
                          {tx.category}
                        </span>
                      </td>
                      <td className="table-cell-desc" title={tx.description}>
                        {tx.description || <span className="text-muted italic">None</span>}
                      </td>
                      <td>
                        <span className="method-pill">{tx.paymentMethod}</span>
                      </td>
                      <td className={`text-right font-mono font-bold ${isIncome ? 'text-income' : 'text-expense'}`}>
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount, currency.code, currency.symbol)}
                      </td>
                      <td>
                        <div className="table-actions flex-center gap-sm">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingTx(tx)}
                            className="action-icon-btn"
                            icon={IoCreateOutline}
                            title="Edit"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeleteOne(tx.id)}
                            className="action-icon-btn action-delete-btn"
                            icon={IoTrashOutline}
                            title="Delete"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="table-footer flex-between">
            <div className="page-size-selector flex-center gap-sm">
              <span className="footer-nav-label">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="form-select footer-select-size"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="pagination-info flex-center gap-lg">
              <span className="footer-pagination-text font-mono">
                {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
              </span>
              <div className="pagination-nav-btns flex-center gap-sm">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  icon={IoChevronBackOutline}
                  className="nav-btn-arrows"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  icon={IoChevronForwardOutline}
                  className="nav-btn-arrows"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Form Dialog Modal */}
      {editingTx && (
        <Modal
          isOpen={!!editingTx}
          onClose={() => setEditingTx(null)}
          title="Modify Transaction"
        >
          <TransactionForm
            initialData={editingTx}
            onClose={() => setEditingTx(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default TransactionList;
