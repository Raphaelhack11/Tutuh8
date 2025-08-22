import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function PlansList(){
  const [plans,setPlans] = useState([]);
  useEffect(()=>{ (async ()=>{ try{ const r = await api("/plans"); setPlans(r.plans); }catch{} })(); },[]);
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(p=>(
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <div className="font-semibold">{p.name}</div>
            <div>Stake: ${p.stake}</div>
            <div>ROI: {p.totalRoi}%</div>
            <div>Duration: {p.durationDays} days</div>
          </div>
        ))}
      </div>
    </div>
  );
}
