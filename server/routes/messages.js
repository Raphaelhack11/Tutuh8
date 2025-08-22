import express from "express";
import { db } from "../startup/db.js";
import { requireAuth } from "./_middleware.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { body } = req.body;
  await db.run("INSERT INTO messages (userId,body,fromAdmin) VALUES (?,?,?)", [req.userId, body, 0]);
  res.json({ ok: true });
});

router.get("/mine", requireAuth, async (req, res) => {
  const rows = await db.all("SELECT * FROM messages WHERE userId=? ORDER BY createdAt DESC", req.userId);
  res.json({ messages: rows });
});

export default router;
