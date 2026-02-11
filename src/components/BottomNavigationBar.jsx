import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNavigationBar.css'; // We'll create this CSS file next
// Import icons from Ionicons (io5)
import { 
  IoHomeOutline, IoHome, 
  IoWalletOutline, IoWallet,
  IoBarChartOutline, IoBarChart,
  IoSettingsOutline, IoSettings
} from 'react-icons/io5';

function BottomNavigationBar({ isModalOpen }) {
  const navClasses = `bottom-nav ${isModalOpen ? 'bottom-nav--hidden' : ''}`;

  // Helper function to render icon and text
  const NavItemContent = ({ isActive, outlineIcon, filledIcon, label }) => (
    <>
      {isActive ? React.createElement(filledIcon, { className: 'nav-icon' }) : React.createElement(outlineIcon, { className: 'nav-icon' })}
      <span className="nav-label">{label}</span>
    </>
  );

  return (
    <nav className={navClasses}>
      <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} end>
        <NavItemContent isActive={({ isActive }) => isActive} outlineIcon={IoHomeOutline} filledIcon={IoHome} label="Dashboard" />
      </NavLink>
      {/* <NavLink to="/transactions" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <span>Icon</span>
        <span>Transactions</span>
      </NavLink> */}
      <NavLink to="/budgets" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NavItemContent isActive={({ isActive }) => isActive} outlineIcon={IoWalletOutline} filledIcon={IoWallet} label="Budgets" />
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NavItemContent isActive={({ isActive }) => isActive} outlineIcon={IoSettingsOutline} filledIcon={IoSettings} label="Settings" />
      </NavLink>
    </nav>
  );
}

export default BottomNavigationBar; 