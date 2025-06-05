"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const mcp_1 = require("@modelcontextprotocol/sdk/server/mcp");
const stdio_1 = require("@modelcontextprotocol/sdk/server/stdio");
const zod_1 = require("zod");
// Handle unexpected errors gracefully
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});
const server = new mcp_1.McpServer({
    name: "Expense Monitor MCP",
    version: "1.0.0",
});
// CREATE expense tool
server.tool("sendExpense", {
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    amount: zod_1.z.number(),
    purpose: zod_1.z.string(),
    mode: zod_1.z.string(),
}, async ({ date, amount, purpose, mode }) => {
    try {
        await axios_1.default.post("http://localhost:3000/api/expenses", {
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
    }
    catch (error) {
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
});
// READ expense tool
server.tool("readExpense", {
    id: zod_1.z.number().int().positive().optional(),
}, async ({ id }) => {
    try {
        let response;
        if (id) {
            response = await axios_1.default.get(`http://localhost:3000/api/expenses/${id}`);
        }
        else {
            response = await axios_1.default.get(`http://localhost:3000/api/expenses`);
        }
        const expenses = response.data;
        if (!expenses || (Array.isArray(expenses) && expenses.length === 0)) {
            return {
                content: [
                    {
                        type: "text",
                        text: id ? `No expense found with id ${id}.` : "No expenses found.",
                    },
                ],
            };
        }
        if (Array.isArray(expenses)) {
            const listText = expenses
                .map((e) => `ID ${e.id}: ₹${e.amount} for "${e.purpose}" via ${e.mode} on ${e.date}`)
                .join("\n");
            return {
                content: [
                    {
                        type: "text",
                        text: `All expenses:\n${listText}`,
                    },
                ],
            };
        }
        else {
            const e = expenses;
            return {
                content: [
                    {
                        type: "text",
                        text: `Expense ID ${e.id}: ₹${e.amount} for "${e.purpose}" via ${e.mode} on ${e.date}`,
                    },
                ],
            };
        }
    }
    catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Failed to read expense${id ? ` with id ${id}` : "s"}: ${error.message || error}`,
                },
            ],
        };
    }
});
// UPDATE expense tool
server.tool("updateExpense", {
    id: zod_1.z.number().int().positive(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    amount: zod_1.z.number(),
    purpose: zod_1.z.string(),
    mode: zod_1.z.string(),
}, async ({ id, date, amount, purpose, mode }) => {
    try {
        await axios_1.default.put(`http://localhost:3000/api/expenses/${id}`, {
            date,
            amount,
            purpose,
            mode,
        });
        return {
            content: [
                {
                    type: "text",
                    text: `Expense with id ${id} updated: ₹${amount} for "${purpose}" via ${mode} on ${date}.`,
                },
            ],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Failed to update expense with id ${id}: ${error.message || error}`,
                },
            ],
        };
    }
});
// DELETE expense tool
server.tool("deleteExpense", {
    id: zod_1.z.number().int().positive(),
}, async ({ id }) => {
    try {
        await axios_1.default.delete(`http://localhost:3000/api/expenses/${id}`);
        return {
            content: [
                {
                    type: "text",
                    text: `Expense with id ${id} has been deleted.`,
                },
            ],
        };
    }
    catch (error) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Failed to delete expense with id ${id}: ${error.message || error}`,
                },
            ],
        };
    }
});
// Start MCP server
const transport = new stdio_1.StdioServerTransport();
(async () => {
    try {
        await server.connect(transport);
        console.error("MCP server is running and connected via stdio.");
        await server.run(); // 🟢 This keeps the server running
    }
    catch (error) {
        console.error("Error while starting MCP server:", error);
    }
})();
