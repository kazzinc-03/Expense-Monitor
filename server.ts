import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const expensesFile = path.join(__dirname, 'expenses.json');

interface Expense {
  date: string;
  amount: number;
  purpose: string;
  mode: string;
}

function readExpenses(): Expense[] {
  try {
    const data = fs.readFileSync(expensesFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeExpenses(expenses: Expense[]) {
  fs.writeFileSync(expensesFile, JSON.stringify(expenses, null, 2));
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
