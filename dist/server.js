"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
const expensesFile = path_1.default.join(__dirname, 'expenses.json');
function readExpenses() {
    try {
        const data = fs_1.default.readFileSync(expensesFile, 'utf-8');
        return JSON.parse(data);
    }
    catch (_a) {
        return [];
    }
}
function writeExpenses(expenses) {
    fs_1.default.writeFileSync(expensesFile, JSON.stringify(expenses, null, 2));
}
// API to get all expenses
app.get('/api/expenses', (req, res) => {
    const expenses = readExpenses();
    res.json(expenses);
});
// API to add a new expense
app.post('/api/expenses', (req, res) => {
    const { date, amount, purpose, mode } = req.body;
    if (!date || !amount || !purpose || !mode) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const expenses = readExpenses();
    expenses.push({ date, amount: Number(amount), purpose, mode });
    writeExpenses(expenses);
    res.json({ message: 'Expense added' });
});
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
