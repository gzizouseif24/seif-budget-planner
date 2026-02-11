import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  // Default currency is USD (no conversion)
  const [currency, setCurrency] = useState('USD');

  // Conversion rate from USD to TND
  const USD_TO_TND_RATE = 2.7;

  const convertAmount = (amountInUSD) => {
    if (currency === 'TND') {
      return amountInUSD * USD_TO_TND_RATE;
    }
    return amountInUSD;
  };

  const formatAmount = (amountInUSD) => {
    const convertedAmount = convertAmount(amountInUSD);
    return convertedAmount.toFixed(2);
  };

  const getCurrencySymbol = () => {
    return currency;
  };

  const toggleCurrency = () => {
    setCurrency(prevCurrency => prevCurrency === 'USD' ? 'TND' : 'USD');
  };

  const value = {
    currency,
    setCurrency,
    toggleCurrency,
    convertAmount,
    formatAmount,
    getCurrencySymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
