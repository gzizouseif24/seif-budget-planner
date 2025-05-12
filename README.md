# Seif Budget Planner

This project is a personal budgeting application built with React and Vite. It helps users track income and expenses, manage categories, set budgets, and visualize their financial data.

## Core Technologies

-   **React:** For building the user interface.
-   **Vite:** For a fast development build tool and server.
-   **Recharts:** For data visualization and charts.
-   **JavaScript (ES6+):** For application logic.
-   **HTML5 & CSS3:** For structure and styling (basic).
-   **Local Storage:** For data persistence in the browser.

## Key Features

-   **Transaction Management:** Add, edit, and delete income and expense transactions.
-   **Category Management:** Create and manage custom categories for transactions, including assigning colors.
-   **Budget Planning:** Set monthly budgets for different expense categories.
-   **Budget View:** See actual spending against budgeted amounts for each category.
-   **Dashboard Summary:** Get a quick overview of total income, expenses, and net balance for the current month.
-   **Spending by Category Chart:** Visualize current month's expense distribution with a pie chart.
-   **Overall Budget Progress:** Track total budgeted vs. total spent, utilization, and status of budgeted categories (over/under/on budget).
-   **Monthly Spending Trend:** View a bar chart of total expenses over the last several months.
-   **Dynamic Updates:** Components refresh automatically when underlying data (transactions, budgets, categories) changes.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
