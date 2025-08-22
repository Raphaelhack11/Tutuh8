import express from "express";
import { db } from "../startup/db.js";
import { sendDepositConfirmed } from "../lib/email.js";

const router = express.Router();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "changeme";

router.post("/crypto", async (req, res) => {
  const sig = req.headers["x-webhook-secret"];
  if (!sig || sig !== WEBHOOK_SECRET) return res.status(401).json({ error: "Unauthorized" });

  const { txId, address, amount, currency, confirmations } = req.body;
  if (!address || !amount) return res.status(400).json({ error: "Missing fields" });

  try {
    const rows = await db.all("SELECT * FROM transactions WHERE type='deposit' AND status='pending'");
    let matched = [];
    for (const r of rows) {
      try {
        const meta = r.meta ? JSON.parse(r.meta) : {};
        if (meta.depositAddress && meta.depositAddress.toLowerCase() === address.toLowerCase() &&
            String(r.amount) === String(amount)) {
          matched.push(r);
        }
      } catch {}
    }

    if (matched.length === 0) return res.json({ ok: false, message: "No pending deposit matches this notification" });

    const requiredConfirmations = Number(process.env.CRYPTO_REQUIRED_CONFIRMATIONS || 1);
    if ((confirmations || 0) < requiredConfirmations) {
      return res.json({ ok: false, message: "Insufficient confirmations" });
    }

    for (const depositTx of matched) {
      await db.run("UPDATE transactions SET status=?, meta=? WHERE id=?", [
        "completed",
        JSON.stringify({ ...JSON.parse(depositTx.meta || "{}"), txId, address, currency, confirmations }),
        depositTx.id
      ]);

      await db.run("UPDATE users SET balance = balance + ? WHERE id=?", [depositTx.amount, depositTx.userId]);

      await db.run(
        "INSERT INTO transactions (userId,type,amount,status,meta,createdAt) VALUES (?,?,?,?,?,?)",
        [depositTx.userId, "deposit:confirmed", depositTx.amount, "completed", JSON.stringify({ txId }), new Date().toISOString()]
      );

      // notify user
      try {
        const u = await db.get("SELECT email FROM users WHERE id=?", depositTx.userId);
        if (u && u.email) await sendDepositConfirmed(u.email, depositTx.amount, currency || depositTx.currency);
      } catch (e) {
        console.warn("sendDepositConfirmed failed", e);
      }
    }

    return res.json({ ok: true, credited: matched.length });
  } catch (e) {
    console.error("Webhook error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
