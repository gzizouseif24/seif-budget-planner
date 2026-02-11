import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { DollarSign } from 'lucide-react';
import './CurrencyToggle.css';

const CurrencyToggle = () => {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <div className="currency-toggle-container">
      <div className="currency-toggle-label">
        <DollarSign size={20} />
        <span>Currency</span>
      </div>
      <div className="currency-toggle-switch-wrapper">
        <span className={`currency-option ${currency === 'USD' ? 'active' : ''}`}>USD</span>
        <button
          className={`toggle-switch ${currency === 'TND' ? 'toggled' : ''}`}
          onClick={toggleCurrency}
          aria-label="Toggle currency"
        >
          <span className="toggle-slider"></span>
        </button>
        <span className={`currency-option ${currency === 'TND' ? 'active' : ''}`}>TND</span>
      </div>
    </div>
  );
};

export default CurrencyToggle;
