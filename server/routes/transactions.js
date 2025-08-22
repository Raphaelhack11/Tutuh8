import express from "express";
import { db } from "../startup/db.js";
import { requireAuth } from "./_middleware.js";
import { sendDepositCreated, sendWithdrawRequested } from "../lib/email.js";

const router = express.Router();

// Hardcoded deposit addresses
const DEPOSIT_ADDRESSES = {
  BTC: "bc1q4c6f7xzsekkpvd2guwkaww4m7se9yjlrxnrjc7",
  ETH: "0x08cFE6DDC3b58B0655dD1c9214BcfdDBD3855CCA",
  LTC: "ltc1qattx7q06hrjs7x8jkruyhjw7pavklwetg0j3wl",
  USDT_TRON: "0x08cFE6DDC3b58B0655dD1c9214BcfdDBD3855CCA"
};

function qrForAddress(addr) {
  return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(addr)}`;
}

router.post("/deposit", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { amount, coin } = req.body;
  if (!amount || Number(amount) < 50) return res.status(400).json({ error: "Minimum deposit $50" });

  const c = (coin || "").toUpperCase();
  if (!["BTC", "ETH", "LTC", "USDT_TRON"].includes(c)) return res.status(400).json({ error: "Unsupported coin" });

  const address = DEPOSIT_ADDRESSES[c];
  const now = new Date().toISOString();

  const result = await db.run(
    `INSERT INTO transactions (userId,type,amount,currency,status,meta,createdAt)
     VALUES (?,?,?,?,?,?,?)`,
    [userId, "deposit", amount, c, "pending", JSON.stringify({ depositAddress: address }), now]
  );

  // Send deposit created email
  try {
    const user = await db.get("SELECT email FROM users WHERE id=?", userId);
    if (user && user.email) await sendDepositCreated(user.email, amount, c);
  } catch (e) {
    console.warn("sendDepositCreated failed", e);
  }

  res.json({
    ok: true,
    deposit: {
      id: result.lastID,
      address,
      qr: qrForAddress(address),
      amount,
      currency: c
    },
    message: "Deposit created. Send the crypto to the address and wait for confirmation."
  });
});

router.post("/deposit/paid", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { depositId } = req.body;
  const tx = await db.get("SELECT * FROM transactions WHERE id=? AND userId=?", depositId, userId);
  if (!tx) return res.status(404).json({ error: "Deposit not found" });
  if (tx.type !== "deposit") return res.status(400).json({ error: "Not a deposit" });
  res.json({ ok: true, message: "Marked as waiting for confirmations. Admin or webhook will confirm." });
});

// Withdraw
router.post("/withdraw", requireAuth, async (req, res) => {
  const userId = req.userId;
  const { amount, toAddress } = req.body;
  if (!amount || Number(amount) < 60) return res.status(400).json({ error: "Minimum withdrawal $60" });

  const user = await db.get("SELECT balance,email FROM users WHERE id=?", userId);
  if (!user) return res.status(400).json({ error: "User not found" });
  if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

  await db.run(
    `INSERT INTO transactions (userId,type,amount,status,meta,createdAt) VALUES (?,?,?,?,?,?)`,
    [userId, "withdrawal", amount, "pending", JSON.stringify({ toAddress }), new Date().toISOString()]
  );

  // Email admin/user
  try {
    await sendWithdrawRequested(user.email, amount, toAddress);
  } catch (e) {
    console.warn("sendWithdrawRequested failed", e);
  }

  res.json({ ok: true, message: "Withdrawal request submitted (pending admin approval)." });
});

router.get("/history", requireAuth, async (req, res) => {
  const userId = req.userId;
  const txs = await db.all("SELECT * FROM transactions WHERE userId=? ORDER BY createdAt DESC, id DESC", userId);
  res.json({ transactions: txs });
});

export default router;
