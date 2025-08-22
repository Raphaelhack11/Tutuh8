import { db } from "../startup/db.js";

export function initSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("ws connected", socket.id);

    socket.on("identify", ({ userId }) => {
      socket.data.userId = userId;
      if (userId) socket.join(`user_${userId}`);
    });

    socket.on("user:message", async ({ userId, body }) => {
      if (!userId || !body) return;
      await db.run("INSERT INTO messages (userId,body,fromAdmin) VALUES (?,?,0)", [userId, body]);
      io.to("admins").emit("admin:new_message", { userId, body });
      socket.emit("message:ack", { ok: true, body });
    });

    socket.on("admin:join", () => {
      socket.join("admins");
    });

    socket.on("admin:reply", async ({ userId, body }) => {
      if (!userId || !body) return;
      await db.run("INSERT INTO messages (userId,body,fromAdmin) VALUES (?,?,1)", [userId, body]);
      io.to(`user_${userId}`).emit("message:fromAdmin", { body });
    });

    socket.on("disconnect", () => {});
  });
}
