import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { basicAuth } from "hono/basic-auth";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { leadStore } from "./trpc/store/leadStore";
import type { IntakeStatus } from "@/types/intake";

const app = new Hono();

app.use("*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Saver.Insurance API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      trpc: "/api/trpc",
      health: "/health",
      docs: "/docs",
    },
  });
});

app.get("/health", (c) => {
  return c.json({ 
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? process.uptime() : 0,
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/docs", (c) => {
  return c.json({
    title: "Saver.Insurance API",
    version: "1.0.0",
    description: "Backend API for Saver.Insurance - P&C Insurance Marketplace",
    webhookEvents: [
      "user_created",
      "policy_uploaded",
      "snapshot_created",
      "video_evidence_added",
      "accident_reported",
      "lead_created",
      "lead_status_changed",
      "lead_needs_followup_24h",
      "lead_stale_48h",
      "agent_signup_pending",
      "agent_verified",
      "agent_rejected",
      "lead_assigned_to_agent",
      "renewal_30d",
      "daily_summary",
    ],
    routes: {
      users: "User management",
      policies: "Policy CRUD operations",
      documents: "Document management",
      reminders: "Payment reminders",
      videoEvidence: "Video evidence storage",
      accidentReports: "Accident report management",
      snapshots: "AI-powered policy snapshots",
      leads: "Lead tracking and management",
      admin: "Admin dashboard and webhooks",
      agents: "P&C agent marketplace",
      agentLeads: "Agent lead assignments",
      subscriptions: "Agent subscription plans",
    },
  });
});

const adminUser = process.env.ADMIN_BASIC_USER || "admin";
const adminPass = process.env.ADMIN_BASIC_PASS || process.env.ADMIN_TOKEN || "saver-admin-2024";

app.use(
  "/api/admin/*",
  basicAuth({
    username: adminUser,
    password: adminPass,
    realm: "Saver Admin",
  })
);

app.get("/api/admin/export/leads.csv", async (c) => {
  const statusParam = c.req.query("status");
  let status: IntakeStatus | undefined;
  
  if (statusParam === "WAITING_DOCS" || statusParam === "NEEDS_INFO" || statusParam === "READY_TO_QUOTE") {
    status = statusParam;
  }
  
  const csv = await leadStore.exportCsv({ status });
  const filename = `leads_${status || "all"}_${new Date().toISOString().split("T")[0]}.csv`;
  
  console.log(`[ADMIN] CSV export: ${csv.split("\n").length - 1} leads, status=${status || "all"}`);
  
  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", `attachment; filename="${filename}"`);
  
  return c.body(csv);
});

app.get("/api/admin/stats", async (c) => {
  const leadStats = await leadStore.getStats();
  return c.json({
    leads: leadStats,
    timestamp: new Date().toISOString(),
  });
});

export default app;
