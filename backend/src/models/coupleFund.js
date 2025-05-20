const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdraw', 'expense']
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  }
});

const coupleFundSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    default: 'Couple Fund'
  },
  description: {
    type: String,
    default: "Let's create goals and make dreams come true"
  },
  image: {
    type: String,
    default: null
  },
  avatarUrls: {
    type: [String],
    default: []
  },
  altImage: {
    type: String,
    default: 'Fund image'
  },
  altAvatar1: {
    type: String,
    default: 'Avatar of person 1'
  },
  altAvatar2: {
    type: String,
    default: 'Avatar of person 2'
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  partners: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    contribution: {
      type: Number,
      default: 0
    }
  }],
  transactions: [transactionSchema],
  goal: {
    name: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      default: 0
    },
    deadline: {
      type: Date
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
coupleFundSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CoupleFund = mongoose.model('CoupleFund', coupleFundSchema, 'couplefunds');

module.exports = CoupleFund; 