// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function AdminDashboard(){
  const [deposits,setDeposits] = useState([]);
  const [withdrawals,setWithdrawals] = useState([]);
  const [messages,setMessages] = useState([]);
  const [users,setUsers] = useState([]);

  useEffect(()=>{ load(); },[]);
  async function load(){
    try{
      const d = await api("/admin/pending/deposits"); setDeposits(d.pending);
      const w = await api("/admin/pending/withdrawals"); setWithdrawals(w.pending);
      const m = await api("/admin/messages"); setMessages(m.messages);
      const u = await api("/admin/users"); setUsers(u.users);
    }catch(e){ console.error(e); }
  }

  async function approveDeposit(id){ await api(`/admin/deposits/${id}/approve`, { method: "POST" }); load(); }
  async function approveWithdraw(id){ await api(`/admin/withdrawals/${id}/approve`, { method: "POST" }); load(); }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2>Admin Dashboard — ProfitBliss</h2>

      <section>
        <h3 className="font-semibold mb-2">Pending Deposits</h3>
        {deposits.length===0 && <div className="text-sm text-slate-400">None</div>}
        {deposits.map(d=>(
          <div key={d.id} className="p-3 bg-white/5 rounded mb-2 flex items-center justify-between">
            <div>{d.email} — ${d.amount}</div>
            <button className="px-2 py-1 bg-green-500 rounded" onClick={()=>approveDeposit(d.id)}>Approve</button>
          </div>
        ))}
      </section>

      <section>
        <h3 className="font-semibold mb-2">Pending Withdrawals</h3>
        {withdrawals.length===0 && <div className="text-sm text-slate-400">None</div>}
        {withdrawals.map(w=>(
          <div key={w.id} className="p-3 bg-white/5 rounded mb-2 flex items-center justify-between">
            <div>{w.email} — ${w.amount}</div>
            <button className="px-2 py-1 bg-green-500 rounded" onClick={()=>approveWithdraw(w.id)}>Approve</button>
          </div>
        ))}
      </section>

      <section>
        <h3 className="font-semibold mb-2">Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Balance</th><th className="py-2 pr-4">Verified</th></tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">${Number(u.balance).toFixed(2)}</td>
                  <td className="py-2 pr-4">{u.emailVerified ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Recent Messages</h3>
        {messages.map(m=>(
          <div key={`${m.id}`} className="p-3 bg-white/5 rounded mb-2">
            <div className="text-xs text-slate-300">{new Date(m.createdAt).toLocaleString()}</div>
            <div className="font-semibold">{m.email || "User #" + m.userId}</div>
            <div>{m.body}</div>
          </div>
        ))}
      </section>
    </div>
  );
    }
