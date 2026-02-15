import "dotenv/config";
// MUST set NODE_ENV before any imports that depend on it
process.env.NODE_ENV = "development"; // Force development mode
console.log("[Server] NODE_ENV:", process.env.NODE_ENV);
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getStripe, handleWebhookEvent } from "../stripe";
import { updateOrderPayment } from "../db";
import { ENV } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Stripe webhook (MUST be before express.json for signature verification)
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    try {
      const stripe = getStripe();
      if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
      const sig = req.headers["stripe-signature"] as string;
      const event = stripe.webhooks.constructEvent(req.body, sig, ENV.stripeWebhookSecret);
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }
      const result = await handleWebhookEvent(event);
      // Update order status if checkout completed
      if (result && (result as any).orderNumber && (result as any).status === "completed") {
        await updateOrderPayment((result as any).orderNumber, "stripe", (result as any).paymentIntentId as string);
      }
      res.json({ received: true });
    } catch (err: any) {
      console.error("[Stripe Webhook] Error:", err.message);
      res.status(400).json({ error: err.message });
    }
  });

  // ─── Health Sync Webhook (건강 데이터 자동 연동) ─────────────────────
  app.post("/api/health-sync/webhook", express.json(), async (req, res) => {
    try {
      const token = req.headers["x-sync-token"] as string || req.query.token as string;
      if (!token) return res.status(401).json({ error: "Missing sync token" });
      const { eq, and } = await import("drizzle-orm");
      const { getDb } = await import("../db");
      const { healthSyncTokens, healthSyncData, healthRecords } = await import("../../drizzle/schema");
      const database = await getDb();
      if (!database) return res.status(500).json({ error: "Database not available" });
      const [syncToken] = await database.select().from(healthSyncTokens).where(and(eq(healthSyncTokens.syncToken, token), eq(healthSyncTokens.isActive, 1))).limit(1);
      if (!syncToken) return res.status(401).json({ error: "Invalid or inactive sync token" });
      const body = req.body;
      const records = Array.isArray(body) ? body : body.records || [body];
      for (const record of records) {
        const dataType = record.dataType || record.type || "unknown";
        let value: number | null = null;
        let unit = "";
        if (dataType === "steps") { value = record.count || record.value; unit = "steps"; }
        else if (dataType === "sleep") { value = record.duration || record.value; unit = "hours"; }
        else if (dataType === "heartRate" || dataType === "heart_rate") { value = record.bpm || record.value; unit = "bpm"; }
        else if (dataType === "weight") { value = record.value; unit = "kg"; }
        else if (dataType === "bloodPressure" || dataType === "blood_pressure") { value = record.systolic || record.value; unit = "mmHg"; }
        else if (dataType === "bloodGlucose" || dataType === "blood_glucose") { value = record.value; unit = "mg/dL"; }
        else if (dataType === "oxygenSaturation") { value = record.value; unit = "%"; }
        else { value = record.value || null; unit = record.unit || ""; }
        await database!.insert(healthSyncData).values({
          userId: syncToken.userId,
          dataType,
          value,
          valueJson: record,
          unit,
          source: syncToken.platform,
          recordedAt: record.startTime ? new Date(record.startTime) : new Date(),
        });
      }
      // Update sync token stats
      await database!.update(healthSyncTokens).set({ lastSyncAt: new Date(), syncCount: (syncToken.syncCount || 0) + 1 }).where(eq(healthSyncTokens.id, syncToken.id));
      // Auto-fill today's health record from synced data
      const today = new Date().toISOString().slice(0, 10);
      const [existing] = await database!.select().from(healthRecords).where(and(eq(healthRecords.userId, syncToken.userId), eq(healthRecords.recordDate, today))).limit(1);
      if (!existing) {
        const updates: any = { userId: syncToken.userId, recordDate: today };
        for (const r of records) {
          const dt = r.dataType || r.type;
          if (dt === "steps") updates.exerciseMinutes = Math.round((r.count || r.value || 0) / 100);
          if (dt === "sleep") updates.sleepHours = r.duration || r.value;
          if (dt === "heartRate" || dt === "heart_rate") updates.heartRate = r.bpm || r.value;
          if (dt === "weight") updates.weight = r.value;
          if (dt === "bloodPressure" || dt === "blood_pressure") { updates.systolicBP = r.systolic; updates.diastolicBP = r.diastolic; }
          if (dt === "bloodGlucose" || dt === "blood_glucose") updates.bloodSugar = r.value;
          if (dt === "hydration") updates.waterIntake = r.value;
        }
        await database!.insert(healthRecords).values(updates);
      }
      console.log(`[HealthSync] Received ${records.length} records from user ${syncToken.userId}`);
      res.json({ success: true, recordsProcessed: records.length });
    } catch (err: any) {
      console.error("[HealthSync Webhook] Error:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
