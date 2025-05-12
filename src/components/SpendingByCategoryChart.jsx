import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getSpendingByCategoryForPeriod } from '../services/budgetUtils';
import './SpendingByCategoryChart.css';

// Define a color palette based on App.css variables or a fixed scheme for the chart
const CHART_COLORS = [
  'var(--accent-color-green)', // Teal-like
  'var(--accent-color-orange)',
  'var(--accent-color-blue)',   // Bluish-purple
  'var(--accent-color-purple)', // More purple
  '#FF6B6B', // A fallback red/coral if more categories
  '#4ECDC4'  // A fallback cyan if more categories
];

function SpendingByCategoryChart({ appRefreshKey, currentMonthPeriod }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [largestCategory, setLargestCategory] = useState(null);

  useEffect(() => {
    if (!currentMonthPeriod) return;
    setLoading(true);
    const spendingData = getSpendingByCategoryForPeriod(currentMonthPeriod);
    
    const processedData = spendingData
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value) // Sort by value descending
      .map((entry, index) => ({
        ...entry,
        name: entry.name, // Ensure name is passed through
        color: entry.categoryColor || CHART_COLORS[index % CHART_COLORS.length] // Use category color or fallback
      }));
    
    setData(processedData);
    if (processedData.length > 0) {
      setLargestCategory(processedData[0]); // The first one after sorting is the largest
    } else {
      setLargestCategory(null);
    }
    setLoading(false);
  }, [currentMonthPeriod, appRefreshKey]);

  if (loading) {
    return <div className="loading-message-chart"><p>Loading chart...</p></div>;
  }
  if (data.length === 0) {
    return <div className="no-data-message-chart"><p>No expenses this month for chart.</p></div>;
  }

  return (
    <div className="spending-chart-card">
      <h4>Spending by Category</h4> {/* Title simplified */}
      <div className="spending-chart-content-area">
        <div className="chart-pie-container">
          <ResponsiveContainer width="100%" height={220}> {/* Adjusted height */}
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                innerRadius={60} // Thicker donut
                outerRadius={90} // Thicker donut
                fill="#8884d8" // Default fill, overridden by Cell
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => {
                  let resolvedColor = entry.color;
                  if (entry.color && entry.color.startsWith('var(')) {
                    const cssVarName = entry.color.match(/--(.*?)\)/)[1];
                    resolvedColor = getComputedStyle(document.documentElement).getPropertyValue(`--${cssVarName}`).trim();
                  }
                  return <Cell key={`cell-${index}`} fill={resolvedColor || '#8884d8'} />;
                })}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`$${value.toFixed(2)}`, props.payload.name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {largestCategory && (
          <div className="chart-highlight-bar-container">
            {/* This is a simplified representation. Design might imply more specific data or text here */}
            {/* <span className="highlight-category-name">{largestCategory.name}</span> */}
            <div 
              className="chart-highlight-bar"
              style={{
                backgroundColor: largestCategory.color && largestCategory.color.startsWith('var(') 
                  ? getComputedStyle(document.documentElement).getPropertyValue(largestCategory.color.match(/--(.*?)\)/)[0]).trim() 
                  : largestCategory.color || '#8884d8'
              }}
            ></div>
            {/* <span className="highlight-category-value">${largestCategory.value.toFixed(2)}</span> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default SpendingByCategoryChart; 