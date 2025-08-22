import React, { useState } from "react";
import { api } from "../lib/api";

const COINS = [
  { id: "BTC", label: "Bitcoin (BTC)" },
  { id: "ETH", label: "Ethereum (ETH)" },
  { id: "LTC", label: "Litecoin (LTC)" },
  { id: "USDT_TRON", label: "Tether (USDT) - TRC20" }
];

export default function Deposit() {
  const [amount, setAmount] = useState(50);
  const [coin, setCoin] = useState("BTC");
  const [depositInfo, setDepositInfo] = useState(null);
  const [msg, setMsg] = useState("");

  async function createDeposit(e) {
    e?.preventDefault();
    if (!amount || Number(amount) < 50) {
      setMsg("Minimum deposit is $50");
      return;
    }
    try {
      const res = await api("/transactions/deposit", { method: "POST", body: { amount: Number(amount), coin } });
      setDepositInfo(res.deposit);
      setMsg(res.message || "Send funds to the address shown.");
    } catch (err) {
      setMsg(err.error || "Failed to create deposit");
    }
  }

  async function markPaid() {
    if (!depositInfo) return;
    try {
      await api("/transactions/deposit/paid", { method: "POST", body: { depositId: depositInfo.id } });
      setMsg("Marked as paid — waiting for confirmations (webhook will auto-confirm).");
    } catch (err) {
      setMsg(err.error || "Failed to mark paid");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Deposit Crypto — ProfitBliss</h1>

      <form onSubmit={createDeposit} className="bg-white p-4 rounded shadow mb-4">
        <div className="mb-3">
          <label className="block text-sm mb-1">Amount (USD)</label>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="input" min="50" />
        </div>

        <div className="mb-3">
          <label className="block text-sm mb-1">Coin</label>
          <select value={coin} onChange={e=>setCoin(e.target.value)} className="input">
            {COINS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">Generate Deposit Address</button>
        </div>
      </form>

      {msg && <div className="mb-4 text-sm text-indigo-700">{msg}</div>}

      {depositInfo && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Send {depositInfo.currency} to this address</h2>
          <div className="break-words bg-gray-100 p-3 rounded mb-3">{depositInfo.address}</div>
          <img src={depositInfo.qr} alt="QR" className="w-48 h-48 mb-3" />
          <div className="flex gap-2">
            <button onClick={markPaid} className="px-3 py-2 bg-indigo-600 text-white rounded">I've Paid (optional)</button>
            <a className="px-3 py-2 bg-slate-200 rounded" href={`https://www.blockchain.com/explorer/tools/qrcode?uri=${encodeURIComponent(depositInfo.address)}`} target="_blank" rel="noreferrer">Open in Explorer</a>
          </div>
        </div>
      )}
    </div>
  );
}
