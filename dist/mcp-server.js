"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
// Handle unexpected errors gracefully
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});
const server = new mcp_js_1.McpServer({
    name: "Expense Monitor MCP",
    version: "1.0.0",
});
server.tool("sendExpense", {
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    amount: zod_1.z.number(),
    purpose: zod_1.z.string(),
    mode: zod_1.z.string(),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ date, amount, purpose, mode }) {
    try {
        yield axios_1.default.post("http://localhost:3000/api/expenses", {
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
}));
const transport = new stdio_js_1.StdioServerTransport();
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield server.connect(transport);
        console.error("MCP server is running and connected via stdio.");
        // Use console.error for logs so stdout stays clean for MCP JSON responses
    }
    catch (error) {
        console.error("Error while starting MCP server:", error);
    }
}))();
