import express from "express";
import bcrypt from "bcryptjs";
import { db } from "../startup/db.js";
import { requireAuth } from "./_middleware.js";

const router = express.Router();

router.post("/update", requireAuth, async (req, res) => {
  const { name, phone } = req.body;
  await db.run("UPDATE users SET name=?, phone=? WHERE id=?", [name || "", phone || "", req.userId]);
  const u = await db.get("SELECT id,name,email,phone,balance FROM users WHERE id=?", req.userId);
  res.json({ ok: true, user: u });
});

router.post("/change-password", requireAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await db.get("SELECT passwordHash FROM users WHERE id=?", req.userId);
  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Old password incorrect" });
  const hash = await bcrypt.hash(newPassword, 10);
  await db.run("UPDATE users SET passwordHash=? WHERE id=?", [hash, req.userId]);
  res.json({ ok: true });
});

export default router;
