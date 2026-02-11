# Basic Web App Budgeting Income Expenses Tracker Project Outline

## Project Setup & Core Structure
- [x] **Initialize React Project:**
  - [x] Set up a new React project using a tool like Create React App or Vite.
- [x] **Establish basic project structure:**
  - [x] Folders for components, services, assets, etc.
- [x] **Implement basic HTML shell (index.html) and main App component.**
- [x] **Define Core Data Structures:**
  - [x] Define JavaScript interfaces/classes for Transaction, Category, and Budget (ref PRD section 4.2).
- [x] **Local Storage Service:**
  - [x] Create a utility module/service to handle all interactions with browser local storage.
  - [x] Implement functions for saving, loading, and updating arrays of transactions, categories, and budgets.
  - [x] Handle data serialization (e.g., JSON.stringify) and deserialization (JSON.parse).

## UI/UX Enhancements & Refinements
- [x] **Implement Header Component:**
  - [x] Create `Header.jsx` and `Header.css` for a consistent app title display.
  - [x] Integrate `<Header />` into `App.jsx`.
- [x] **Refactor Add/Edit Transaction Flow to Modal:**
  - [x] Create `TransactionModal.jsx` and `TransactionModal.css`.
  - [x] Modify `DashboardPage.jsx` to use the modal for adding/editing transactions.
  - [x] Update `App.jsx` state and props to manage modal visibility and data flow.
  - [x] Ensure `RecentTransactionsList` on Dashboard can trigger edit modal.
  - [x] Improve modal scrollability and mobile fit.
- [x] **Streamline Navigation:**
  - [x] Remove standalone `TransactionsPage.jsx` and its route.
  - [x] Remove "Transactions" link from `BottomNavigationBar.jsx`.
  - [x] Make `BottomNavigationBar` hide when `TransactionModal` is open.

## Transaction Management
- [x] **Implement Add Transaction UI & Logic:**
  - [x] Create a React component for the "Add Transaction" form (date, amount, category selector, type selector (income/expense), optional note).
  - [x] Implement logic to save new transactions to local storage.
  - [x] Ensure form validation (e.g., amount is a number, date is valid).
- [x] **Implement Transaction List View:**
  - [x] Create a component to display the list of all transactions.
  - [x] Each transaction item should show key details (date, description/category, amount, type).
  - [x] Load transaction data from local storage.
- [x] **Implement Edit Transaction Functionality:**
  - [x] Add functionality to select a transaction from the list for editing.
  - [x] Reuse or adapt the "Add Transaction" form for editing.
  - [x] Update the transaction in local storage.
- [x] **Implement Delete Transaction Functionality:**
  - [x] Add functionality to delete a transaction from the list (with confirmation).
  - [x] Remove the transaction from local storage.
- [x] **Implement Basic Transaction Filtering:**
  - [x] Add UI controls (e.g., dropdowns, date pickers) to filter the transaction list (e.g., by type, category, date range).
  - [x] Apply filters to the displayed transaction data.

## Categorization
- [x] **Implement Pre-defined Categories:**
  - [x] Populate local storage with initial pre-defined income and expense categories (as per PRD 2.2) on first app load if no categories exist.
- [x] **Implement Custom Category Management UI & Logic:**
  - [x] Create a UI section for users to add new custom categories.
  - [x] Allow users to specify category name, type (income/expense), and select a color.
  - [x] Save custom categories to local storage.
  - [x] (Optional: Allow editing/deleting custom categories). (Delete implemented)
- [x] **Integrate Categories into Transaction Form:**
  - [x] Ensure the category selector in the "Add/Edit Transaction" form dynamically loads both pre-defined and custom categories from local storage.

## Budget Planning
- [x] **Implement Set Budget UI & Logic:**
  - [x] Create a UI view for setting monthly spending limits per expense category.
  - [x] Allow users to select an expense category and input a budget amount.
  - [x] Save budget settings to local storage.
- [x] **Implement Budget Tracking Logic:**
  - [x] Develop logic to calculate actual spending for each category for the current month based on transaction data.
  - [x] Compare actual spending against the set budget.
- [x] **Implement Budget Visualization:**
  - [x] In the "Budget" view, display each budgeted category, its limit, actual spending, and remaining/overspent amount.
  - [x] Include visual indicators (e.g., progress bars, color coding) for budget status (under/over).

## Dashboard & Reports
- [x] **Implement Dashboard Summary View:**
  - [x] Create the main Dashboard component.
  - [x] Display current month's total income, total expenses, and net balance.
  - [x] Fetch and process necessary data from local storage.
- [x] **Implement Spending by Category Chart:** (Styling to match design pending)
  - [x] Integrate a simple charting library (Recharts).
  - [x] Create `SpendingByCategoryChart.jsx` component.
- [x] **Implement Budget Progress Visualization on Dashboard/Reports:** (Styling to match design pending)
  - [x] Show a summary of budget progress (e.g., overall budget utilization, number of categories over/under budget) on the Dashboard.
  - [x] Create `BudgetProgressSummary.jsx` component.
- [x] **Implement Monthly Spending Trends (Simple):**
  - [x] Create a simple bar chart in the Dashboard showing total expenses month-over-month.
  - [x] Create `MonthlySpendingTrendChart.jsx` component.
- [x] **Implement Recent Transactions List on Dashboard:**
  - [x] Create `RecentTransactionsList.jsx` component to display latest transactions with emojis.

## Application Restructuring & Navigation
- [x] **Define New App Structure & Pages (Conceptual):** Based on UX best practices (Dashboard, ~~Transactions~~, Budgets, Reports, Settings).
- [x] **Implement React Router for Page-Based Navigation.**
- [x] **Create Page Wrapper Components:**
  - [x] `src/pages/DashboardPage.jsx`
  - [x] ~~`src/pages/TransactionsPage.jsx`~~ (Removed)
  - [x] `src/pages/BudgetsPage.jsx`
  - [x] `src/pages/ReportsPage.jsx`
  - [x] `src/pages/SettingsPage.jsx`
- [x] **Create `BottomNavigationBar.jsx` Component.**
- [x] **Relocate Existing Components to New Page Wrappers.** (Marking as complete as core relocation is done)
- [ ] Style `BottomNavigationBar.jsx` according to the new design.

## User Interface & Mobile Considerations
- [ ] **Implement Main App Navigation:** (Superseded by 'Application Restructuring & Navigation')
  - [ ] ~~Set up routing (e.g., using React Router) for the main views (Dashboard, Add Transaction, Transactions, Budget, Reports).~~
  - [ ] ~~Implement mobile-first navigation, such as a bottom navigation bar as suggested in PRD 6.2.~~
- [ ] **Develop Responsive UI Components:**
  - [ ] Ensure all UI components are designed mobile-first and are responsive to various screen sizes.
  - [ ] Focus on touch-friendly controls (buttons, input fields).
- [ ] **Global Styling & Clean Interface:** (In Progress - Implementing new design)
  - [x] Implement core dark theme and base styling (`App.css`).
  - [x] Integrate 'Satoshi' custom font.
  - [x] Style `RecentTransactionsList` component (initial version).
  - [x] Style `DashboardSummary` component to match design.
  - [x] Style `BudgetProgressSummary` component (minimal with progress bar).
  - [ ] Style `SpendingByCategoryChart` component (Donut chart, custom legend/layout).
  - [x] Style `App.jsx` main layout (gradient background) and application title (via Header and index.html).
  - [x] Define global button styles (`.btn`, `.btn-primary`, etc.).
  - [x] Define global form element styles (`input`, `select`, `textarea`, `label`).
  - [x] Style `TransactionList.jsx` items for dark theme.
  - [x] Style `BudgetPlanner.jsx` for dark theme (card, inputs, list).
  - [x] Style `BudgetView.jsx` for dark theme (card, list items, progress bars).
  - [ ] Apply consistent and minimal CSS styling for a clean, uncluttered interface (ongoing with new design - focus on remaining components).
  - [ ] Optimize input forms for mobile keyboards.
- [ ] **Offline Capability:**
  - [ ] Ensure the app functions correctly without an internet connection after initial load (largely inherent but good to keep in mind for any external resources like fonts if added).

## Nice-to-Have Features (If Time Permits)
- [ ] **Implement Data Export (CSV):**
  - [ ] Add a feature to export transaction data to a CSV file.
- [ ] **Implement Data Import (CSV):**
  - [ ] Add a feature to import transactions from a CSV file (define a clear format).
- [x] **Implement Dark Mode (as primary theme).**
- [ ] **Implement Simple Budget Notifications (Optional):**
  - [ ] Explore simple client-side notifications if a budget limit is approached or exceeded (e.g., visual cues in the app).
- [ ] **Implement Recurring Transaction Templates:**
  - [ ] Allow users to create templates for recurring transactions to speed up entry.

## Testing & DeploymentD
- [ ] **Manual Testing:**
  - [ ] Thoroughly test all features on various mobile browsers and screen sizes.
  - [ ] Test edge cases and data validation.
- [ ] **Build & Deployment Preparation:**
  - [ ] Set up a build process for the React application.
  - [ ] Prepare for deployment to a static web hosting service (e.g., GitHub Pages, Netlify, Vercel). 