import mongoose from "mongoose";

export const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Salary',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, required: true, enum: ["income", "expense"] },
    amount: { type: Number, required: true, min: 0.01 },
    description: { type: String, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Transaction", transactionSchema);
