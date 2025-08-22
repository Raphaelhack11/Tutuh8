import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import PlansList from "./pages/PlansList";
import ActivePlans from "./pages/ActivePlans";
import TransactionsPage from "./pages/Transactions";
import VerifyPage from "./pages/VerifyPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/plans" element={<PlansList />} />
        <Route path="/plans/active" element={<ActivePlans />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verified" element={<div className="p-6 max-w-xl mx-auto text-center">Email verified ✅ — you can login now.</div>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
          }
