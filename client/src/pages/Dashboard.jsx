import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("pb_user") || "null"));
  const [balance, setBalance] = useState(user?.balance || 0);
  const [plans, setPlans] = useState([]);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    fetchPlans();
    refreshMe();
    fetchTxs();
  }, []);

  async function refreshMe() {
    try {
      const r = await api("/auth/me");
      setUser(r.user);
      setBalance(r.user.balance || 0);
      localStorage.setItem("pb_user", JSON.stringify(r.user));
    } catch {}
  }

  async function fetchPlans() {
    try {
      const r = await api("/plans");
      setPlans(r.plans || []);
    } catch {}
  }

  async function fetchTxs() {
    try {
      const r = await api("/transactions/history");
      setTxs(r.transactions || []);
    } catch {}
  }

  async function subscribe(plan) {
    setLoading(true);
    try {
      const r = await api("/plans/subscribe", { method: "POST", body: { planId: plan.id } });
      if (r.ok) nav("/plans/active");
    } catch (err) {
      if (err && err.error) {
        if (err.needDeposit) {
          if (confirm("Insufficient balance. Go to Deposit?")) nav("/deposit");
        } else {
          alert(err.error);
        }
      } else alert("Subscribe failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-lg p-4 shadow">
          <div className="text-sm text-slate-500">Account Balance</div>
          <div className="text-3xl font-bold">${Number(balance).toFixed(2)}</div>
        </div>

        <div className="col-span-2 bg-white rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Plans</h2>
            <div className="text-sm text-slate-400">Choose and subscribe</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <div key={p.id} className="p-4 border rounded-lg hover:shadow-lg transition">
                <div className="font-bold text-lg">{p.name}</div>
                <div className="mt-2 text-sm">Stake: ${p.stake}</div>
                <div className="text-sm">Total ROI: {p.totalRoi}%</div>
                <div className="text-sm">Duration: {p.durationDays} days</div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => subscribe(p)}
                    disabled={loading}
                    className="px-3 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
                  >
                    Subscribe
                  </button>
                  {balance < p.stake && (
                    <button
                      onClick={() => nav("/deposit")}
                      className="px-3 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
                    >
                      Deposit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Recent Transactions</h3>
        <div className="bg-white rounded p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {txs.slice(0, 8).map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="py-2 pr-4">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-4">{t.type}</td>
                  <td className="py-2 pr-4">${Number(t.amount).toFixed(2)}</td>
                  <td className="py-2 pr-4">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
