import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import './CurrencySwitcher.css';

const CurrencySwitcher = () => {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <div className="currency-switcher">
      <button
        className={`currency-button ${currency === 'USD' ? 'active' : ''}`}
        onClick={toggleCurrency}
        title="Switch currency"
      >
        <span className="currency-label">Currency:</span>
        <span className="currency-value">{currency}</span>
      </button>
    </div>
  );
};

export default CurrencySwitcher;
