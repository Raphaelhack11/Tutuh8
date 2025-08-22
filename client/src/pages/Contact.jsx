import React, { useState } from "react";
import { api } from "../lib/api";

export default function Contact() {
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      await api("/messages", { method: "POST", body: { body } });
      setMsg("Message sent. We'll reply to marshabills9@gmail.com shortly.");
      setBody("");
    } catch (err) {
      setMsg(err.error || "Failed to send");
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Contact ProfitBliss</h2>

      <div className="mb-4">
        <div><strong>Email:</strong> marshabills9@gmail.com</div>
        <div className="mt-1"><strong>Phone:</strong> +1 (703) 940-2611</div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <textarea required value={body} onChange={(e) => setBody(e.target.value)} className="input" placeholder="Your message" />
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Send</button>
      </form>

      {msg && <div className="mt-3 text-sm">{msg}</div>}
    </div>
  );
      }
