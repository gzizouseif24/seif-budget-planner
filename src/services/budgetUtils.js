import { getTransactions, getCategories, getBudgets, getBudgetForCategoryAndPeriod } from './localStorageService';

/**
 * Calculates the total actual spending for a given category within a specific period.
 * Only considers transactions of type 'expense'.
 * @param {string} categoryId - The ID of the category.
 * @param {string} period - The period string, e.g., "YYYY-MM".
 * @returns {number} The total actual spending for that category in that period.
 */
export function calculateActualSpending(categoryId, period) {
  const allTransactions = getTransactions();
  let actualSpending = 0;

  allTransactions.forEach(transaction => {
    // Assuming transaction.date is "YYYY-MM-DD"
    if (
      transaction.categoryId === categoryId &&
      transaction.type === 'expense' &&
      transaction.date && typeof transaction.date === 'string' && // Ensure date exists and is a string
      transaction.date.startsWith(period) // Checks if transaction date is in the given month
    ) {
      actualSpending += transaction.amount; // Amount should be positive for expenses
    }
  });

  return actualSpending;
}

/**
 * Calculates total income for a specific period.
 * @param {string} period - The period string, e.g., "YYYY-MM".
 * @returns {number} The total income for that period.
 */
export function calculateTotalIncomeForPeriod(period) {
  const allTransactions = getTransactions();
  let totalIncome = 0;
  allTransactions.forEach(transaction => {
    if (
      transaction.type === 'income' &&
      transaction.date && typeof transaction.date === 'string' &&
      transaction.date.startsWith(period)
    ) {
      totalIncome += transaction.amount;
    }
  });
  return totalIncome;
}

/**
 * Calculates total expenses for a specific period across all categories.
 * @param {string} period - The period string, e.g., "YYYY-MM".
 * @returns {number} The total expenses for that period.
 */
export function calculateTotalExpensesForPeriod(period) {
  const allTransactions = getTransactions();
  let totalExpenses = 0;
  allTransactions.forEach(transaction => {
    if (
      transaction.type === 'expense' &&
      transaction.date && typeof transaction.date === 'string' &&
      transaction.date.startsWith(period)
    ) {
      totalExpenses += transaction.amount;
    }
  });
  return totalExpenses;
}

/**
 * Gets spending data grouped by category for a specific period.
 * Used for pie/bar charts.
 * @param {string} period - The period string, e.g., "YYYY-MM".
 * @returns {Array<{name: string, value: number, color: string}>} Data for charting.
 */
export function getSpendingByCategoryForPeriod(period) {
  const allTransactions = getTransactions();
  const allCategories = getCategories();
  const categoryMap = allCategories.reduce((acc, cat) => {
    acc[cat.id] = { name: cat.name, color: cat.color || '#8884d8' }; // Default color if none
    return acc;
  }, {});

  const spending = {};

  allTransactions.forEach(transaction => {
    if (
      transaction.type === 'expense' &&
      transaction.date && typeof transaction.date === 'string' &&
      transaction.date.startsWith(period) &&
      categoryMap[transaction.categoryId]
    ) {
      if (!spending[transaction.categoryId]) {
        spending[transaction.categoryId] = 0;
      }
      spending[transaction.categoryId] += transaction.amount;
    }
  });

  return Object.keys(spending).map(categoryId => ({
    name: categoryMap[categoryId].name,
    value: spending[categoryId],
    color: categoryMap[categoryId].color,
  })).sort((a,b) => b.value - a.value); // Sort by value descending
}

/**
 * Calculates an overall budget summary for a given period.
 * @param {string} period - The period string, e.g., "YYYY-MM".
 * @returns {Object} Summary including total budgeted, total spent, utilization, and category counts.
 */
export function getOverallBudgetSummary(period) {
  const allCategories = getCategories();
  const expenseCategories = allCategories.filter(cat => cat.type === 'expense');
  
  let totalBudgeted = 0;
  let totalSpentOnBudgetedCategories = 0;
  let categoriesOver = 0;
  let categoriesUnder = 0;
  let categoriesOnBudget = 0;
  let budgetedCategoryCount = 0;

  expenseCategories.forEach(category => {
    const budgetData = getBudgetForCategoryAndPeriod(category.id, period);
    if (budgetData && budgetData.amount > 0) {
      budgetedCategoryCount++;
      const budgetAmount = budgetData.amount;
      totalBudgeted += budgetAmount;
      const actualSpending = calculateActualSpending(category.id, period);
      totalSpentOnBudgetedCategories += actualSpending;

      if (actualSpending > budgetAmount) {
        categoriesOver++;
      } else if (actualSpending < budgetAmount) {
        categoriesUnder++;
      } else {
        categoriesOnBudget++;
      }
    }
  });

  const overallUtilization = totalBudgeted > 0 ? (totalSpentOnBudgetedCategories / totalBudgeted) * 100 : 0;

  return {
    totalBudgeted,
    totalSpentOnBudgetedCategories,
    overallUtilization: parseFloat(overallUtilization.toFixed(1)), // One decimal place for utilization
    categoriesOver,
    categoriesUnder,
    categoriesOnBudget,
    budgetedCategoryCount
  };
}

/**
 * Gets total monthly expenses for a specified number of past months including the current month.
 * @param {number} numberOfMonths - How many months of trend data to retrieve (e.g., 6 for last 6 months).
 * @returns {Array<{name: string, totalExpenses: number}>} Monthly spending data sorted oldest to newest.
 */
export function getMonthlySpendingTrend(numberOfMonths) {
  const trendData = [];
  const today = new Date();

  for (let i = numberOfMonths - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const period = `${year}-${month}`;
    
    const totalExpenses = calculateTotalExpensesForPeriod(period);
    trendData.push({ name: period, totalExpenses });
  }
  return trendData;
} 