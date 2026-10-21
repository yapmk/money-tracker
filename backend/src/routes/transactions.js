import { Router } from 'express';
import mongoose from 'mongoose';
import Transaction, { CATEGORIES } from '../models/transaction.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const filter = { user: req.user.id };

    if (req.query.from) {
      const from = new Date(req.query.from);
      if (isNaN(from.getTime())) {
        return res.status(400).json({ message: 'invalid from date' });
      }
      filter.date = { ...(filter.date || {}), $gte: from };
    }
    if (req.query.to) {
      const to = new Date(req.query.to);
      if (isNaN(to.getTime())) {
        return res.status(400).json({ message: 'invalid to date' });
      }
      filter.date = { ...(filter.date || {}), $lte: to };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(1000);
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

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

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

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.type = type;
    transaction.amount = numericAmount;
    transaction.description = description;
    transaction.category = category;
    if (date) transaction.date = new Date(date);

    await transaction.save();
    res.json(transaction);
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