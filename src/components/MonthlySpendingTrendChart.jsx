import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getMonthlySpendingTrend } from '../services/budgetUtils';

const NUM_MONTHS_TREND = 6; // Show last 6 months trend

function MonthlySpendingTrendChart({ appRefreshKey }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const trendData = getMonthlySpendingTrend(NUM_MONTHS_TREND);
    setData(trendData);
    setLoading(false);
  }, [appRefreshKey]);

  if (loading) {
    return <p>Loading monthly spending trend...</p>;
  }
  if (data.length === 0) {
    return <p>Not enough data to display monthly spending trend.</p>;
  }

  return (
    <div style={{ margin: '20px auto', maxWidth: '800px', height: '400px' }}>
      <h4>Monthly Expenses Trend (Last {NUM_MONTHS_TREND} Months)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="totalExpenses" fill="#82ca9d" name="Total Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlySpendingTrendChart; 