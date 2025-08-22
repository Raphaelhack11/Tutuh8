import { db } from "../startup/db.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function startRoiWorker(io) {
  const intervalMinutes = Number(process.env.ROI_WORKER_INTERVAL_MINUTES || 60);

  async function run() {
    try {
      const ups = await db.all(
        `SELECT up.*, p.totalRoi, p.durationDays, p.stake
         FROM user_plans up JOIN plans p ON up.planId = p.id
         WHERE up.active=1`
      );

      const now = new Date();
      for (const up of ups) {
        try {
          const last = up.lastCreditedAt ? new Date(up.lastCreditedAt) : new Date(up.startAt);
          const days = Math.floor((now - last) / DAY_MS);
          if (days >= 1) {
            const totalRoiPercent = up.totalRoi || 0;
            const dailyFraction = (totalRoiPercent / 100) / up.durationDays;
            const dailyCredit = up.stake * dailyFraction;
            const credit = dailyCredit * days;

            if (credit > 0) {
              await db.run("UPDATE users SET balance = balance + ? WHERE id=?", [credit, up.userId]);
              await db.run(
                "INSERT INTO transactions (userId,type,amount,status,meta,createdAt) VALUES (?,?,?,?,?,?)",
                [up.userId, "roi", credit, "completed", JSON.stringify({ userPlanId: up.id, days }), new Date().toISOString()]
              );
            }

            const newLast = new Date(last.getTime() + days * DAY_MS).toISOString();
            await db.run("UPDATE user_plans SET lastCreditedAt=? WHERE id=?", [newLast, up.id]);

            if (new Date(up.endAt) <= now) {
              await db.run("UPDATE user_plans SET active=0 WHERE id=?", up.id);
            }
          }
        } catch (e) {
          console.error("ROI per-plan error:", e);
        }
      }

      await db.run("DELETE FROM verify_tokens WHERE createdAt <= datetime('now','-1 day')");
    } catch (e) {
      console.error("ROI worker top error:", e);
    } finally {
      if (io) io.to("admins").emit("roi:cycle", { at: new Date().toISOString() });
    }
  }

  await run();
  setInterval(run, intervalMinutes * 60 * 1000);
          }
