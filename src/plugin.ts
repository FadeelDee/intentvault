import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const PROTOCOL_VERSION = "2026-07-28";

function createServer() {
  const server = new McpServer(
    { name: "intentvault", version: "0.1.0" },
    { supportedProtocolVersions: [PROTOCOL_VERSION] },
  );

  // Tool 1: List current financial intents
  server.registerTool(
    "list_intents",
    {
      title: "List financial intents",
      description: "Returns the user's active financial intents and rules that agents should respect.",
      inputSchema: z.object({}).strict(),
      outputSchema: z.object({
        intents: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            type: z.string(),
            status: z.string(),
          })
        ),
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const intents = [
        {
          id: "1",
          title: "Monthly spending limit",
          description: "Keep discretionary spending under $300 this month",
          type: "goal",
          status: "active",
        },
        {
          id: "2",
          title: "New merchant rule",
          description: "Never auto-approve any payment to a new merchant above $100",
          type: "rule",
          status: "active",
        },
        {
          id: "3",
          title: "SOL DCA plan",
          description: "DCA $50 USDC into SOL every Friday",
          type: "plan",
          status: "active",
        },
      ];

      return {
        content: [
          {
            type: "text",
            text: `You have ${intents.length} active financial intents:\n\n` +
              intents.map(i => `• ${i.title}: ${i.description}`).join("\n"),
          },
        ],
        structuredContent: { intents },
      };
    },
  );

  // Tool 2: Check if an action conflicts with intents
  server.registerTool(
    "check_against_intents",
    {
      title: "Check action against intents",
      description: "Checks whether a proposed payment or action conflicts with the user's financial intents.",
      inputSchema: z.object({
        action: z.string().min(1).max(500),
        amount_usd: z.number().optional(),
      }).strict(),
      outputSchema: z.object({
        allowed: z.boolean(),
        reason: z.string(),
        conflicting_intent: z.string().optional(),
      }).strict(),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ action, amount_usd }) => {
      let allowed = true;
      let reason = "This action does not conflict with any active intents.";
      let conflicting_intent: string | undefined;

      if (amount_usd && amount_usd > 100 && action.toLowerCase().includes("new")) {
        allowed = false;
        reason = "This payment is above $100 to what appears to be a new merchant. It conflicts with your 'New merchant rule'.";
        conflicting_intent = "New merchant rule";
      } else if (amount_usd && amount_usd > 250) {
        allowed = false;
        reason = "This amount is high relative to your $300 monthly discretionary limit.";
        conflicting_intent = "Monthly spending limit";
      }

      return {
        content: [
          {
            type: "text",
            text: allowed
              ? `✅ Allowed. ${reason}`
              : `⚠️ Conflict detected. ${reason}`,
          },
        ],
        structuredContent: {
          allowed,
          reason,
          conflicting_intent,
        },
      };
    },
  );

  // Tool 3: Create a new intent (demo version – just confirms)
  server.registerTool(
    "create_intent",
    {
      title: "Create financial intent",
      description: "Creates a new financial intent or rule for the user.",
      inputSchema: z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1).max(500),
        type: z.enum(["goal", "rule", "plan"]),
      }).strict(),
      outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
        intent_id: z.string(),
      }).strict(),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ title, description, type }) => {
      return {
        content: [
          {
            type: "text",
            text: `✅ New intent created successfully!\n\nTitle: ${title}\nType: ${type}\nDescription: ${description}\n\n(In a full version this would be saved permanently to your vault.)`,
          },
        ],
        structuredContent: {
          success: true,
          message: "Intent created (demo mode)",
          intent_id: "demo-" + Date.now(),
        },
      };
    },
  );

  return server;
}

serveStdio(createServer, { legacy: "reject" });