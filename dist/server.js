"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db = require("./db");
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// GET all expenses
app.get('/api/expenses', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM expenses ORDER BY date DESC');
        const expenses = stmt.all();
        res.json(expenses);
    }
    catch (err) {
        console.error("Failed to fetch expenses:", err);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});
// GET a single expense by id
app.get('/api/expenses/:id', (req, res) => {
    const id = Number(req.params.id);
    try {
        const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
        const expense = stmt.get(id);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json(expense);
    }
    catch (err) {
        console.error("Failed to fetch expense:", err);
        res.status(500).json({ error: 'Failed to fetch expense' });
    }
});
// POST (Create) a new expense
app.post('/api/expenses', (req, res) => {
    const { date, amount, purpose, mode } = req.body;
    if (!date || !amount || !purpose || !mode) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const stmt = db.prepare('INSERT INTO expenses (date, amount, purpose, mode) VALUES (?, ?, ?, ?)');
        const result = stmt.run(date, amount, purpose, mode);
        res.json({ message: 'Expense added', id: result.lastInsertRowid });
    }
    catch (err) {
        console.error("Failed to add expense:", err);
        res.status(500).json({ error: 'Failed to add expense' });
    }
});
// PUT (Update) an existing expense by id
app.put('/api/expenses/:id', (req, res) => {
    const id = Number(req.params.id);
    const { date, amount, purpose, mode } = req.body;
    if (!date || !amount || !purpose || !mode) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const stmt = db.prepare(`UPDATE expenses
       SET date = ?, amount = ?, purpose = ?, mode = ?
       WHERE id = ?`);
        const result = stmt.run(date, amount, purpose, mode, id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense updated' });
    }
    catch (err) {
        console.error("Failed to update expense:", err);
        res.status(500).json({ error: 'Failed to update expense' });
    }
});
// DELETE an expense by id
app.delete('/api/expenses/:id', (req, res) => {
    const id = Number(req.params.id);
    try {
        const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
        const result = stmt.run(id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted' });
    }
    catch (err) {
        console.error("Failed to delete expense:", err);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
