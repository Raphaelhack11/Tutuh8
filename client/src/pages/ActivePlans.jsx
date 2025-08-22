import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function ActivePlans() {
  const [active, setActive] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const r = await api("/plans/active");
        setActive(r.active || []);
      } catch {}
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Active Plans</h2>
      {active.length === 0 ? (
        <div className="text-slate-500">You have no active plans.</div>
      ) : (
        active.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded shadow mb-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{a.name}</div>
                <div className="text-sm text-slate-500">Stake: ${a.stake} • ROI: {a.totalRoi}%</div>
              </div>
              <div className="text-sm text-slate-400">
                Ends: {new Date(a.endAt).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 text-sm">Last credited: {a.lastCreditedAt ? new Date(a.lastCreditedAt).toLocaleString() : 'N/A'}</div>
          </div>
        ))
      )}
    </div>
  );
}
