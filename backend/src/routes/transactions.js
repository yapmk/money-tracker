import { Router } from 'express';
import mongoose from 'mongoose';
import Transaction, { CATEGORIES } from '../models/transaction.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(100);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body || {};

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ message: 'type must be income or expense' });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0.01) {
      return res.status(400).json({ message: 'amount must be a number >= 0.01' });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'invalid category' });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount: numericAmount,
      description,
      category,
      date: date ? new Date(date) : Date.now(),
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await transaction.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;