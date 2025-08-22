import express from "express";
import { db } from "../startup/db.js";
import { requireAuth } from "./_middleware.js";
import { sendSubscriptionEmail } from "../lib/email.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const plans = await db.all("SELECT * FROM plans");
  res.json({ plans });
});

router.post("/subscribe", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { planId } = req.body;
    const plan = await db.get("SELECT * FROM plans WHERE id=?", planId);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    const user = await db.get("SELECT * FROM users WHERE id=?", userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < plan.stake) {
      return res.status(402).json({ error: "Insufficient balance", needDeposit: true });
    }

    await db.run("UPDATE users SET balance = balance - ? WHERE id=?", [plan.stake, userId]);

    const startAt = new Date().toISOString();
    const endAt = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString();

    await db.run(
      "INSERT INTO user_plans (userId, planId, startAt, lastCreditedAt, endAt, active) VALUES (?,?,?,?,?,?)",
      [userId, planId, startAt, startAt, endAt, 1]
    );

    await db.run("INSERT INTO transactions (userId,type,amount,status) VALUES (?,?,?,?)", [
      userId,
      "subscribe",
      plan.stake,
      "completed"
    ]);

    try {
      await sendSubscriptionEmail(user.email, plan.name, plan.stake, plan.totalRoi);
    } catch (e) {
      console.warn("Subscription email failed:", e);
    }

    res.json({ ok: true, message: "Subscribed", redirect: "/plans/active" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/active", requireAuth, async (req, res) => {
  const userId = req.userId;
  const rows = await db.all(
    `SELECT up.*, p.name, p.totalRoi, p.stake, p.durationDays
     FROM user_plans up JOIN plans p ON up.planId = p.id
     WHERE up.userId=? AND up.active=1`,
    userId
  );
  res.json({ active: rows });
});

export default router;
