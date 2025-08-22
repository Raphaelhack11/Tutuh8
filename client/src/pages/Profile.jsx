import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Profile(){
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("pb_user") || "null"));
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [msg, setMsg] = useState(null);
  useEffect(()=>{ setForm({ name: user?.name || "", phone: user?.phone || "" }); }, [user]);

  async function save(e){
    e.preventDefault();
    try{
      await api("/user/update", { method: "POST", body: form });
      const me = await api("/auth/me");
      setUser(me.user);
      localStorage.setItem("pb_user", JSON.stringify(me.user));
      setMsg("Profile updated");
    }catch(err){ setMsg(err.error || "Failed"); }
  }

  async function changePassword(e){
    e.preventDefault();
    const oldP = e.target.oldPassword.value;
    const newP = e.target.newPassword.value;
    try{
      await api("/user/change-password", { method: "POST", body: { oldPassword: oldP, newPassword: newP }});
      setMsg("Password changed");
      e.target.reset();
    }catch(err){ setMsg(err.error || "Failed"); }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4">Profile — ProfitBliss</h2>
      <form onSubmit={save} className="space-y-3">
        <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Change Password</h3>
        <form onSubmit={changePassword} className="space-y-3">
          <input name="oldPassword" type="password" placeholder="Old password" className="input" />
          <input name="newPassword" type="password" placeholder="New password" className="input" />
          <button className="px-4 py-2 bg-green-600 text-white rounded">Change Password</button>
        </form>
      </div>

      {msg && <div className="mt-3 text-sm">{msg}</div>}
    </div>
  );
}
