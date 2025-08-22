import userExtra from "./routes/userExtra.js";app.use("/api/user", userExtra);
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { initDb, seedInitialData } from "./startup/db.js";
import authRoutes from "./routes/auth.js";
import plansRoutes from "./routes/plans.js";
import txRoutes from "./routes/transactions.js";
import adminRoutes from "./routes/admin.js";
import messagesRoutes from "./routes/messages.js";
import webhookRoutes from "./routes/webhook.js";
import { initSocketHandlers } from "./ws/socket.js";
import { startRoiWorker } from "./workers/roiWorker.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: true, credentials: true }
});

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// Initialize DB and seed
await initDb();
await seedInitialData();

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/webhook", webhookRoutes);

// Socket handlers
initSocketHandlers(io);

// Start ROI worker
startRoiWorker(io).catch(console.error);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server and WS listening on ${PORT}`);
});
