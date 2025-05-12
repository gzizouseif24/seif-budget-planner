import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNavigationBar.css'; // We'll create this CSS file next

function BottomNavigationBar({ isModalOpen }) {
  const navClasses = `bottom-nav ${isModalOpen ? 'bottom-nav--hidden' : ''}`;

  return (
    <nav className={navClasses}>
      <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} end>
        {/* Replace with actual icons later */}
        <span>Icon</span>
        <span>Dashboard</span>
      </NavLink>
      {/* <NavLink to="/transactions" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <span>Icon</span>
        <span>Transactions</span>
      </NavLink> */}
      <NavLink to="/budgets" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <span>Icon</span>
        <span>Budgets</span>
      </NavLink>
      <NavLink to="/reports" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <span>Icon</span>
        <span>Reports</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <span>Icon</span>
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}

export default BottomNavigationBar; 