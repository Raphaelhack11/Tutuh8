import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function TransactionsPage(){
  const [txs, setTxs] = useState([]);
  useEffect(()=>{ (async ()=>{
    try{ const r = await api("/transactions/history"); setTxs(r.transactions); }catch(err){}
  })(); }, []);
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Transactions</h2>
      <div className="bg-white rounded p-4">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left border-b"><th>Date</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {txs.map(t=>(
              <tr key={t.id} className="border-b">
                <td className="py-2">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="py-2">{t.type}</td>
                <td className="py-2">${Number(t.amount).toFixed(2)}</td>
                <td className="py-2">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
    }
