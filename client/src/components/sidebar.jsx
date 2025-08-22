import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded ${isActive ? "bg-indigo-600 text-white" : "text-slate-200 hover:bg-white/10"}`;

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 min-h-screen hidden md:block">
      <div className="mb-6 text-2xl font-bold">ProfitBliss</div>
      <nav className="flex flex-col gap-2">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/deposit" className={linkClass}>Deposit</NavLink>
        <NavLink to="/withdraw" className={linkClass}>Withdraw</NavLink>
        <NavLink to="/plans/active" className={linkClass}>Active Plans</NavLink>
        <NavLink to="/plans" className={linkClass}>Plans</NavLink>
        <NavLink to="/transactions" className={linkClass}>Transactions</NavLink>
        <NavLink to="/profile" className={linkClass}>Profile</NavLink>
        <NavLink to="/about" className={linkClass}>About</NavLink>
        <NavLink to="/contact" className={linkClass}>Contact</NavLink>
      </nav>
    </aside>
  );
}
