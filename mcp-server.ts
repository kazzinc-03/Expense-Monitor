import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Handle unexpected errors gracefully
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

const server = new McpServer({
  name: "Expense Monitor MCP",
  version: "1.0.0",
});

server.tool(
  "sendExpense",
  {
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    amount: z.number(),
    purpose: z.string(),
    mode: z.string(),
  },
  async ({ date, amount, purpose, mode }) => {
    try {
      await axios.post("http://localhost:3000/api/expenses", {
        date,
        amount,
        purpose,
        mode,
      });

      return {
        content: [
          {
            type: "text",
            text: `Expense recorded: ₹${amount} for "${purpose}" via ${mode} on ${date}.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to record expense: ${error.message || error}`,
          },
        ],
      };
    }
  }
);

const transport = new StdioServerTransport();

(async () => {
  try {
    await server.connect(transport);
    console.error("MCP server is running and connected via stdio.");
    // Use console.error for logs so stdout stays clean for MCP JSON responses
  } catch (error) {
    console.error("Error while starting MCP server:", error);
  }
})();
