import React, { useState } from 'react';
import { IoAddOutline, IoCloudUploadOutline } from 'react-icons/io5';
import TransactionList from '../components/Transactions/TransactionList';
import TransactionForm from '../components/Transactions/TransactionForm';
import CSVImport from '../components/Transactions/CSVImport';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export const TransactionsPage = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <div className="transactions-page flex-column gap-lg">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Track, filter, search, and manage your cash flows.</p>
        </div>
        <div className="page-actions flex-center gap-sm">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsImportOpen(true)}
            icon={IoCloudUploadOutline}
          >
            Import CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddOpen(true)}
            icon={IoAddOutline}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      <TransactionList />

      {/* Add Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Transaction"
        >
          <TransactionForm onClose={() => setIsAddOpen(false)} />
        </Modal>
      )}

      {/* CSV Import Modal */}
      {isImportOpen && (
        <Modal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          title="Import Bank Statement"
          size="lg"
        >
          <CSVImport onImportComplete={() => setIsImportOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default TransactionsPage;
