import React, { useState } from "react";
import { api } from "../lib/api";

export default function Withdraw(){
  const [amount, setAmount] = useState("");
  const [addr, setAddr] = useState("");
  const [msg, setMsg] = useState(null);

  async function submit(e){
    e.preventDefault();
    try{
      const res = await api("/transactions/withdraw",{ method:"POST", body:{ amount: Number(amount), toAddress: addr }});
      setMsg(res.message || "Withdrawal requested (pending)");
      setAmount(""); setAddr("");
    }catch(e){ setMsg(e.error || "Error"); }
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2>Withdraw — ProfitBliss</h2>
      <form onSubmit={submit} className="space-y-3">
        <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} className="input" />
        <input placeholder="Destination wallet address" value={addr} onChange={e=>setAddr(e.target.value)} className="input" />
        <button className="px-3 py-2 bg-red-500 rounded text-white">Request Withdraw</button>
      </form>
      {msg && <div className="mt-3">{msg}</div>}
    </div>
  );
}
