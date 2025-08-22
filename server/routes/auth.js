import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../startup/db.js";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../lib/email.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "secret";

// register
router.post("/register", async (req, res) => {
  const { name, email, password, phone, referral } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });
  if (referral && referral !== "tmdf28dns") return res.status(400).json({ error: "Invalid referral code" });

  try {
    const pwHash = await bcrypt.hash(password, 10);
    await db.run("INSERT INTO users (name,email,passwordHash,phone,referral) VALUES (?,?,?,?,?)", [
      name || "",
      email,
      pwHash,
      phone || "",
      referral || null
    ]);

    const token = uuidv4();
    await db.run("INSERT INTO verify_tokens (token,email) VALUES (?,?)", [token, email]);
    try {
      await sendVerificationEmail(email, token);
    } catch (e) {
      console.warn("sendVerificationEmail failed:", e);
    }

    res.json({ ok: true, message: "Registered — verification email sent" });
  } catch (err) {
    res.status(400).json({ error: "Email already in use" });
  }
});

// verify (via token)
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;
  const row = await db.get("SELECT email FROM verify_tokens WHERE token=?", token);
  if (!row) return res.status(400).send("Invalid or expired token");
  await db.run("UPDATE users SET emailVerified=1 WHERE email=?", row.email);
  await db.run("DELETE FROM verify_tokens WHERE token=?", token);
  const FE = process.env.FRONTEND_URL || "http://localhost:5173";
  return res.redirect(`${FE}/verified`);
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.get("SELECT * FROM users WHERE email=?", email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  if (!user.emailVerified) return res.status(403).json({ error: "Email not verified" });

  const token = jwt.sign({ userId: user.id, isAdmin: !!user.isAdmin }, SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: { id: user.id, email: user.email, balance: user.balance, name: user.name, isAdmin: !!user.isAdmin, phone: user.phone }
  });
});

// me endpoint to refresh user
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "No token" });
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, SECRET);
    const user = await db.get("SELECT id,name,email,balance,isAdmin,emailVerified,phone FROM users WHERE id=?", payload.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
