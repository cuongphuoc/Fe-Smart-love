const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdraw']
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: String
});

const coupleFundSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  image: String,
  balance: {
    type: Number,
    default: 0
  },
  goal: {
    name: String,
    amount: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  avatarUrls: [String],
  transactions: [transactionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
coupleFundSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CoupleFund', coupleFundSchema); 