// Core Data Structures for the Budgeting App

// Transaction Structure
// Represents a single income or expense event.
// {
//   id: string,       // Unique identifier (e.g., UUID or timestamp-based)
//   date: string,     // Date of the transaction (e.g., "YYYY-MM-DD")
//   amount: number,   // The monetary value of the transaction
//   categoryId: string, // ID linking to a Category
//   type: string,     // "income" or "expense"
//   note?: string     // Optional user-added note or description
// }

// Category Structure
// Represents a classification for transactions.
// {
//   id: string,       // Unique identifier
//   name: string,     // Name of the category (e.g., "Groceries", "Salary")
//   type: string,     // "income" or "expense"
//   color?: string    // Optional color for UI theming (e.g., hex code "#FF5733")
// }

// Budget Structure
// Represents a spending limit for a specific category over a defined period.
// {
//   id: string,       // Unique identifier (e.g., categoryId + period for uniqueness)
//   categoryId: string, // ID linking to an expense Category
//   amount: number,   // The budgeted amount for the period
//   period: string    // The period the budget applies to (e.g., "YYYY-MM" for monthly)
// }

// Example of generating a unique ID (to be implemented in localStorageService or similar)
// function generateId() {
//   return Date.now().toString(36) + Math.random().toString(36).substring(2);
// } 