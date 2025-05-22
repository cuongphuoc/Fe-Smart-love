const CoupleFund = require('../models/coupleFund');

// Get transactions for a fund
exports.getTransactions = async (req, res) => {
  try {
    const { fundId } = req.params;
    const userId = req.headers['user-id'];

    const fund = await CoupleFund.findOne({ _id: fundId, userId });
    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund not found' });
    }

    // Sort transactions by date in descending order
    const transactions = fund.transactions.sort((a, b) => b.date - a.date);

    return res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add a new transaction
exports.addTransaction = async (req, res) => {
  try {
    const { fundId, amount, type, description } = req.body;
    const userId = req.headers['user-id'];

    console.log('Processing transaction:', {
      fundId,
      amount,
      type,
      description,
      userId
    });

    // Validate required fields
    if (!fundId || !amount || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['fundId', 'amount', 'type'],
        received: { fundId, amount, type }
      });
    }

    const fund = await CoupleFund.findOne({ _id: fundId, userId });
    if (!fund) {
      console.log('Fund not found:', { fundId, userId });
      return res.status(404).json({ 
        success: false, 
        message: 'Fund not found',
        details: { fundId, userId }
      });
    }

    console.log('Found fund:', {
      fundId: fund._id,
      currentBalance: fund.balance,
      name: fund.name
    });

    // Ensure amount is a valid number
    const transactionAmount = Math.abs(parseInt(amount));
    if (isNaN(transactionAmount)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount provided',
        received: amount,
        parsed: transactionAmount
      });
    }

    // Create new transaction
    const transaction = {
      type,
      amount: transactionAmount,
      description,
      date: new Date(),
      createdBy: userId
    };

    console.log('Created transaction:', transaction);

    // Update fund balance based on transaction type
    const previousBalance = fund.balance || 0;
    if (type === 'deposit') {
      fund.balance = previousBalance + transactionAmount;
    } else if (type === 'withdraw') {
      fund.balance = previousBalance - transactionAmount;
    }

    console.log('Updated balance:', {
      previous: previousBalance,
      change: type === 'deposit' ? transactionAmount : -transactionAmount,
      new: fund.balance
    });

    // Add transaction to array
    fund.transactions.push(transaction);

    // Save changes
    try {
      await fund.save();
      console.log('Successfully saved fund with new transaction');
    } catch (saveError) {
      console.error('Error saving fund:', saveError);
      throw saveError;
    }

    return res.json({
      success: true,
      data: fund
    });
  } catch (error) {
    console.error('Transaction error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      type: error.name
    });
  }
};

// Get transaction history for a fund
exports.getTransactionHistory = async (req, res) => {
  try {
    const { fundId } = req.params;
    const userId = req.headers['user-id'];

    const fund = await CoupleFund.findOne({ _id: fundId, userId });
    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund not found' });
    }

    // Sort transactions by date in descending order
    const transactions = fund.transactions.sort((a, b) => b.date - a.date);

    // Group transactions by month
    const groupedTransactions = transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(transaction);
      return groups;
    }, {});

    res.json({ 
      success: true, 
      data: {
        transactions: groupedTransactions,
        summary: {
          totalDeposits: transactions.reduce((sum, t) => t.type === 'deposit' ? sum + t.amount : sum, 0),
          totalWithdraws: transactions.reduce((sum, t) => t.type === 'withdraw' ? sum + t.amount : sum, 0),
          totalExpenses: transactions.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0)
        }
      }
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
  try {
    const { fundId } = req.params;
    const userId = req.headers['user-id'];
    const { startDate, endDate } = req.query;

    const fund = await CoupleFund.findOne({ _id: fundId, userId });
    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund not found' });
    }

    // Filter transactions by date range if provided
    let transactions = fund.transactions;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      transactions = transactions.filter(t => 
        t.date >= start && t.date <= end
      );
    }

    // Calculate statistics
    const stats = {
      totalTransactions: transactions.length,
      byType: {
        deposits: transactions.filter(t => t.type === 'deposit').length,
        withdraws: transactions.filter(t => t.type === 'withdraw').length,
        expenses: transactions.filter(t => t.type === 'expense').length
      },
      amounts: {
        totalDeposits: transactions.reduce((sum, t) => t.type === 'deposit' ? sum + t.amount : sum, 0),
        totalWithdraws: transactions.reduce((sum, t) => t.type === 'withdraw' ? sum + t.amount : sum, 0),
        totalExpenses: transactions.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0)
      },
      byCategory: transactions.reduce((categories, t) => {
        if (!categories[t.category]) {
          categories[t.category] = { count: 0, total: 0 };
        }
        categories[t.category].count++;
        categories[t.category].total += t.amount;
        return categories;
      }, {})
    };

    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}; 