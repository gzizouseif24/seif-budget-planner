import React from 'react';
import TransactionForm from './TransactionForm';
import './TransactionModal.css'; // We'll create this CSS file next

function TransactionModal({ isOpen, onClose, onTransactionSubmit, existingTransaction }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <TransactionForm 
          onTransactionSubmit={onTransactionSubmit} 
          existingTransaction={existingTransaction} 
        />
        <button onClick={onClose} className="btn btn-secondary modal-close-btn">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default TransactionModal; 