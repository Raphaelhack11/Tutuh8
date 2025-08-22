import React from "react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
