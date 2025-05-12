// localStorageService.js - Handles all interactions with browser local storage

const TRANSACTIONS_KEY = 'budgetApp_transactions';
const CATEGORIES_KEY = 'budgetApp_categories';
const BUDGETS_KEY = 'budgetApp_budgets';

const initialCategories = [
  { id: "cat_food_expense", name: "Groceries", type: "expense", color: "#FFD700", emoji: "🛒" },
  { id: "cat_salary_income", name: "Salary", type: "income", color: "#ADFF2F", emoji: "💰" },
  { id: "cat_transport_expense", name: "Transport", type: "expense", color: "#87CEFA", emoji: "🚗" },
  { id: "cat_utilities_expense", name: "Utilities", type: "expense", color: "#FF8C00", emoji: "💡" },
  { id: "cat_freelance_income", name: "Freelance", type: "income", color: "#32CD32", emoji: "💼" },
  { id: "cat_entertainment_expense", name: "Entertainment", type: "expense", color: "#DB7093", emoji: "🎉" },
  { id: "cat_health_expense", name: "Health", type: "expense", color: "#FF69B4", emoji: "🏥" },
  { id: "cat_education_expense", name: "Education", type: "expense", color: "#1E90FF", emoji: "🎓" },
  { id: "cat_gifts_income", name: "Gifts", type: "income", color: "#FFC0CB", emoji: "🎁" },
  { id: "cat_other_expense", name: "Other", type: "expense", color: "#D3D3D3", emoji: "❓" }
];

/**
 * Generates a simple unique ID.
 * Combines timestamp with a random string for basic uniqueness.
 * For more robust needs, a library like UUID might be considered.
 * @returns {string} A unique ID string.
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Saves data to local storage under a specific key.
 * Automatically serializes the data to JSON.
 * @param {string} key - The key under which to store the data.
 * @param {any} data - The data to store (will be JSON.stringified).
 */
function saveToLocalStorage(key, data) {
  try {
    const serializedData = JSON.stringify(data);
    console.log(`[LS_Service] saveToLocalStorage - Key: ${key}, Attempting to save:`, serializedData.substring(0, 200) + (serializedData.length > 200 ? '...' : '')); // Log part of data
    localStorage.setItem(key, serializedData);
    console.log(`[LS_Service] saveToLocalStorage - Key: ${key}, Save successful.`);
  } catch (error) {
    console.error(`[LS_Service] Error saving data to local storage for key "${key}":`, error);
    throw error; // Re-throw the error so it can be caught by the caller
  }
}

/**
 * Loads data from local storage for a specific key.
 * Automatically deserializes the JSON data.
 * @param {string} key - The key from which to retrieve the data.
 * @param {any} defaultValue - The value to return if the key is not found or data is invalid.
 * @returns {any} The deserialized data or the defaultValue.
 */
function loadFromLocalStorage(key, defaultValue = []) {
  try {
    const serializedData = localStorage.getItem(key);
    console.log(`[LS_Service] loadFromLocalStorage - Key: ${key}, Raw data from LS:`, serializedData ? serializedData.substring(0, 200) + (serializedData.length > 200 ? '...' : '') : null);
    
    if (serializedData === null) {
      console.log(`[LS_Service] loadFromLocalStorage - Key: ${key}, No data found, returning default.`);
      return defaultValue;
    }
    const parsedData = JSON.parse(serializedData);
    console.log(`[LS_Service] loadFromLocalStorage - Key: ${key}, Parsed data:`, JSON.parse(JSON.stringify(parsedData.slice ? parsedData.slice(-3) : parsedData))); // Log part of array or full object
    return parsedData;
  } catch (error) {
    console.error(`[LS_Service] Error loading data from local storage for key "${key}":`, error);
    // If parsing fails, it might be corrupted data. Consider returning defaultValue or re-throwing.
    // For now, returning defaultValue to prevent app crash on corrupted data.
    return defaultValue;
  }
}

// --- Transaction Specific Functions ---

/**
 * Retrieves all transactions from local storage.
 * @returns {Array<Object>} An array of transaction objects.
 */
export const getTransactions = () => {
  console.log('[LS_Service] getTransactions - Attempting to load transactions.');
  const transactions = loadFromLocalStorage(TRANSACTIONS_KEY, []);
  console.log('[LS_Service] getTransactions - Loaded transactions count:', transactions.length);
  return transactions;
};

/**
 * Adds a new transaction to local storage.
 * Assigns a unique ID and current date if not provided.
 * @param {Object} transactionData - The transaction object to add (without id, date is optional).
 * @returns {Object} The newly added transaction object with id and date.
 */
export const addTransaction = (transactionData) => {
  console.log('[LS_Service] addTransaction - Received transactionData:', JSON.parse(JSON.stringify(transactionData)));
  const transactions = getTransactions(); // Calls getTransactions, which will also log
  console.log('[LS_Service] addTransaction - Transactions BEFORE push:', JSON.parse(JSON.stringify(transactions.slice(-3))));
  const newTransaction = {
    id: generateId(),
    date: transactionData.date || new Date().toISOString().split('T')[0], // Ensure date is used from input
    ...transactionData,
  };
  // Ensure amount is a number
  if (typeof newTransaction.amount === 'string') {
    newTransaction.amount = parseFloat(newTransaction.amount);
  }
  if (isNaN(newTransaction.amount)) {
    console.error('[LS_Service] addTransaction - Invalid amount, cannot add transaction:', newTransaction);
    throw new Error('Transaction amount is invalid.');
  }

  console.log('[LS_Service] addTransaction - newTransaction object to be added:', JSON.parse(JSON.stringify(newTransaction)));
  transactions.push(newTransaction);
  console.log('[LS_Service] addTransaction - Transactions AFTER push, BEFORE save:', JSON.parse(JSON.stringify(transactions.slice(-3))));
  try {
    saveToLocalStorage(TRANSACTIONS_KEY, transactions);
    console.log('[LS_Service] addTransaction - Called saveToLocalStorage for transactions.');
  } catch (error) {
    console.error('[LS_Service] addTransaction - Error saving transactions:', error);
    // Optionally, revert the push if save fails, though this adds complexity
    // transactions.pop(); 
    throw error; // Propagate error to inform the UI
  }
  return JSON.parse(JSON.stringify(newTransaction)); // Return a deep copy
};

/**
 * Updates an existing transaction in local storage.
 * @param {Object} updatedTransaction - The transaction object with updated data (must include id).
 * @returns {Object | null} The updated transaction object or null if not found.
 */
export const updateTransaction = (updatedTransaction) => {
  let transactions = getTransactions();
  const transactionIndex = transactions.findIndex(t => t.id === updatedTransaction.id);

  if (transactionIndex === -1) {
    console.warn('Transaction not found for update:', updatedTransaction.id);
    return null;
  }

  transactions[transactionIndex] = {
    ...transactions[transactionIndex],
    ...updatedTransaction,
  };
  saveToLocalStorage(TRANSACTIONS_KEY, transactions);
  return transactions[transactionIndex];
};

/**
 * Deletes a transaction from local storage by its ID.
 * @param {string} transactionId - The ID of the transaction to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export const deleteTransaction = (transactionId) => {
  let transactions = getTransactions();
  const initialLength = transactions.length;
  transactions = transactions.filter(t => t.id !== transactionId);

  if (transactions.length < initialLength) {
    saveToLocalStorage(TRANSACTIONS_KEY, transactions);
    return true;
  }
  console.warn('Transaction not found for deletion:', transactionId);
  return false;
};

// --- Category Specific Functions ---

/**
 * Retrieves all categories from local storage.
 * If no categories are found, initializes them with default values.
 * Includes logic to add missing emojis to existing categories from initialCategories.
 * @returns {Array<Object>} An array of category objects.
 */
export const getCategories = () => {
  let categories = loadFromLocalStorage(CATEGORIES_KEY, null); // Load with null to detect if not present
  let needsSave = false;

  if (categories === null) {
    console.log('No categories found in local storage. Initializing with default categories.');
    // Ensure initialCategories has emojis (already done in previous step)
    categories = initialCategories; 
    needsSave = true; // Need to save the initialized categories
  } else {
    // Categories exist, check if emojis need to be added/migrated
    console.log('Existing categories found. Checking for missing emojis...');
    const initialCategoriesMap = initialCategories.reduce((map, cat) => {
      map[cat.id] = cat;
      return map;
    }, {});

    categories = categories.map(existingCat => {
      // Check if the emoji property exists
      if (!existingCat.hasOwnProperty('emoji')) {
        console.log(`Category "${existingCat.name}" (ID: ${existingCat.id}) is missing emoji. Attempting to add.`);
        const matchingInitialCat = initialCategoriesMap[existingCat.id];
        if (matchingInitialCat) {
          // Found a match in the default list, use its emoji
          existingCat.emoji = matchingInitialCat.emoji;
          console.log(`  -> Added emoji: ${existingCat.emoji}`);
          needsSave = true;
        } else {
          // No match found (likely a user-added custom category), add default
          existingCat.emoji = '❓'; 
          console.log(`  -> Added default emoji: ${existingCat.emoji}`);
          needsSave = true;
        }
      }
      // Return the category, potentially updated
      return existingCat;
    });
  }

  // Save back to local storage ONLY if initialization happened or emojis were added
  if (needsSave) {
    console.log('Saving updated categories (initialization or emoji migration).');
    saveToLocalStorage(CATEGORIES_KEY, categories);
  }

  return categories;
};

/**
 * Adds a new category to local storage.
 * Assigns a unique ID if not provided.
 * @param {Object} categoryData - The category object to add (id is optional).
 * @returns {Object} The newly added category object with id.
 */
export const addCategory = (categoryData) => {
  const categories = getCategories();
  const newCategory = {
    id: categoryData.id || generateId(), // Allow pre-defined IDs or generate new
    ...categoryData,
  };
  categories.push(newCategory);
  saveToLocalStorage(CATEGORIES_KEY, categories);
  return newCategory;
};

/**
 * Updates an existing category in local storage.
 * @param {Object} updatedCategory - The category object with updated data (must include id).
 * @returns {Object | null} The updated category object or null if not found.
 */
export const updateCategory = (updatedCategory) => {
  let categories = getCategories();
  const categoryIndex = categories.findIndex(c => c.id === updatedCategory.id);

  if (categoryIndex === -1) {
    console.warn('Category not found for update:', updatedCategory.id);
    return null;
  }

  categories[categoryIndex] = {
    ...categories[categoryIndex],
    ...updatedCategory,
  };
  saveToLocalStorage(CATEGORIES_KEY, categories);
  return categories[categoryIndex];
};

/**
 * Deletes a category from local storage by its ID.
 * (Note: Does not currently check for dependencies in transactions or budgets)
 * @param {string} categoryId - The ID of the category to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export const deleteCategory = (categoryId) => {
  let categories = getCategories();
  const initialLength = categories.length;
  categories = categories.filter(c => c.id !== categoryId);

  if (categories.length < initialLength) {
    saveToLocalStorage(CATEGORIES_KEY, categories);
    return true;
  }
  console.warn('Category not found for deletion:', categoryId);
  return false;
};

// --- Budget Specific Functions ---

/**
 * Retrieves all budget settings from local storage.
 * @returns {Array<Object>} An array of budget objects.
 */
export const getBudgets = () => {
  return loadFromLocalStorage(BUDGETS_KEY, []);
};

/**
 * Saves (adds or updates) a budget setting in local storage.
 * The budget ID is constructed from categoryId and period for uniqueness.
 * @param {Object} budgetData - The budget data, must include categoryId, period, and amount.
 * @returns {Object} The saved budget object with its generated id.
 */
export const saveBudget = (budgetData) => {
  const { categoryId, period, amount } = budgetData;
  if (!categoryId || !period || amount === undefined) {
    console.error('Invalid budget data: categoryId, period, and amount are required.', budgetData);
    // Potentially throw an error or return a specific failure indicator
    return null; 
  }

  const budgets = getBudgets();
  const budgetId = `${categoryId}_${period}`;
  const existingBudgetIndex = budgets.findIndex(b => b.id === budgetId);

  const budgetToSave = {
    id: budgetId,
    categoryId,
    period,
    amount,
  };

  if (existingBudgetIndex !== -1) {
    budgets[existingBudgetIndex] = budgetToSave;
  } else {
    budgets.push(budgetToSave);
  }

  saveToLocalStorage(BUDGETS_KEY, budgets);
  return budgetToSave;
};

/**
 * Deletes a budget from local storage by its ID.
 * The ID is typically categoryId + '_' + period.
 * @param {string} budgetId - The ID of the budget to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export const deleteBudget = (budgetId) => {
  let budgets = getBudgets();
  const initialLength = budgets.length;
  budgets = budgets.filter(b => b.id !== budgetId);

  if (budgets.length < initialLength) {
    saveToLocalStorage(BUDGETS_KEY, budgets);
    return true;
  }
  console.warn('Budget not found for deletion:', budgetId);
  return false;
};

/**
 * Retrieves a specific budget for a given category and period.
 * @param {string} categoryId - The ID of the category.
 * @param {string} period - The period (e.g., "YYYY-MM").
 * @returns {Object | undefined} The budget object if found, otherwise undefined.
 */
export const getBudgetForCategoryAndPeriod = (categoryId, period) => {
  const budgets = getBudgets();
  const budgetId = `${categoryId}_${period}`;
  return budgets.find(b => b.id === budgetId);
};

// We can export specific functions as we build them out, e.g.:
// export const getTransactions = () => loadFromLocalStorage(TRANSACTIONS_KEY);
// export const saveTransactions = (transactions) => saveToLocalStorage(TRANSACTIONS_KEY, transactions); 