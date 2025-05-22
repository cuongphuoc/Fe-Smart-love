const CoupleFund = require('../models/coupleFund');
const { saveBase64Image, getImageUrl, deleteImage } = require('../utils/imageHelper');

// Get all couple funds for a user
const getCoupleFund = async (req, res) => {
  try {
    console.log('[DEBUG] Đang lấy couple funds...');
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find all funds for the user
    const funds = await CoupleFund.find({ userId }).sort({ updatedAt: -1 });
    
    console.log('[DEBUG] Số lượng funds tìm thấy:', funds.length);
    
    // Process funds and convert image paths to full URLs
    const processedFunds = funds.map(fund => {
      const fundObj = fund.toObject();
      
      // Convert image paths to full URLs
      if (fundObj.image) {
        fundObj.image = getImageUrl(req, fundObj.image);
      }
      
      if (fundObj.avatarUrls && fundObj.avatarUrls.length > 0) {
        fundObj.avatarUrls = fundObj.avatarUrls.map(avatar => 
          avatar ? getImageUrl(req, avatar) : null
        );
      }
      
      return {
        ...fundObj,
        lastSync: new Date().toISOString()
      };
    });
    
    res.json({
      success: true,
      data: processedFunds,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting couple funds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get couple funds',
      error: error.message
    });
  }
};

// Create or update couple fund
const updateCoupleFund = async (req, res) => {
  try {
    console.log('[DEBUG] Đang cập nhật couple fund với dữ liệu:', req.body);
    const userId = req.headers['user-id'];
    const { 
      id, 
      name, 
      description, 
      image,
      avatarUrls,  
      goal, 
      balance, 
      partners 
    } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    let fund;
    let oldImage = null;
    
    if (id) {
      // Update existing fund
      fund = await CoupleFund.findOne({ _id: id, userId });
      
      if (!fund) {
        return res.status(404).json({
          success: false,
          message: 'Fund not found'
        });
      }
      
      // Store old image path for deletion if needed
      oldImage = fund.image;
    } else {
      // Create new fund
      fund = new CoupleFund({
        userId,
        name: name || 'Our Fund',
        description: description || "Let's create goals and make dreams come true",
        balance: balance || 0,
        partners: partners || [],
        goal: goal || {},
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Process new image if provided
    if (image && image !== oldImage) {
      if (typeof image === 'string' && image.startsWith('data:image')) {
        // Delete old image if exists
        if (oldImage) {
          deleteImage(oldImage);
        }
        // Save new image
        const savedImagePath = saveBase64Image(image, 'funds');
        fund.image = savedImagePath;
      } else if (!image.startsWith('data:image')) {
        // If not base64, assume it's a URL and use as is
        fund.image = image;
      }
    }
    
    // Process avatar images if provided
    if (avatarUrls && Array.isArray(avatarUrls)) {
      const processedAvatars = await Promise.all(avatarUrls.map(async (avatar) => {
        if (avatar && typeof avatar === 'string' && avatar.startsWith('data:image')) {
          return saveBase64Image(avatar, 'avatars');
        }
        return avatar;
      }));
      fund.avatarUrls = processedAvatars;
    }
    
    // Update other fund details
    if (name) fund.name = name;
    if (description) fund.description = description;
    if (goal) fund.goal = { ...fund.goal, ...goal };
    if (partners) fund.partners = partners;
    
    // Handle balance update through a transaction
    if (typeof balance !== 'undefined') {
      // Directly set the new balance without calculating difference
      fund.balance = parseInt(balance);
    }
    
    // Save to database
    await fund.save();
    console.log('[DEBUG] Đã lưu fund vào database');
    
    // Convert saved fund to response object with full image URLs
    const fundObj = fund.toObject();
    
    // Convert image paths to full URLs
    if (fundObj.image) {
      fundObj.image = getImageUrl(req, fundObj.image);
    }
    
    if (fundObj.avatarUrls && fundObj.avatarUrls.length > 0) {
      fundObj.avatarUrls = fundObj.avatarUrls.map(avatar => 
        avatar ? getImageUrl(req, avatar) : null
      );
    }
    
    res.json({
      success: true,
      data: fundObj
    });
  } catch (error) {
    console.error('Error updating couple fund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update couple fund',
      error: error.message
    });
  }
};

// Add partner to fund
const addPartner = async (req, res) => {
  try {
    console.log('[DEBUG] Đang thêm đối tác:', req.body);
    const userId = req.headers['user-id'];
    const { fundId, name, email } = req.body;
    
    if (!userId || !fundId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID, fund ID, partner name and email are required'
      });
    }
    
    // Find fund
    const fund = await CoupleFund.findOne({ _id: fundId, userId });
    
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fund not found'
      });
    }
    
    // Check if partner already exists
    const partnerExists = fund.partners.some(p => p.email === email);
    
    if (partnerExists) {
      return res.status(400).json({
        success: false,
        message: 'Partner with this email already exists'
      });
    }
    
    // Add new partner
    fund.partners.push({ name, email });
    await fund.save();
    
    res.json({
      success: true,
      data: fund
    });
  } catch (error) {
    console.error('Error adding partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add partner',
      error: error.message
    });
  }
};

// Remove partner from fund
const removePartner = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { fundId } = req.query;
    const { partnerId } = req.params;
    
    if (!userId || !fundId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and fund ID are required'
      });
    }
    
    // Find fund
    const fund = await CoupleFund.findOne({ _id: fundId, userId });
    
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fund not found'
      });
    }
    
    // Remove partner
    fund.partners = fund.partners.filter(p => p._id.toString() !== partnerId);
    await fund.save();
    
    res.json({
      success: true,
      data: fund
    });
  } catch (error) {
    console.error('Error removing partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove partner',
      error: error.message
    });
  }
};

// Add transaction to fund
const addTransaction = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { fundId, amount, type, category, description, createdBy } = req.body;
    
    console.log('[DEBUG] Processing transaction request:', {
      userId,
      fundId,
      amount,
      type,
      category,
      description,
      createdBy
    });
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
        details: { missedField: 'userId' }
      });
    }
    
    if (!fundId) {
      return res.status(400).json({
        success: false,
        message: 'Fund ID is required',
        details: { missedField: 'fundId' }
      });
    }
    
    if (!amount && amount !== 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
        details: { missedField: 'amount' }
      });
    }
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Type is required',
        details: { missedField: 'type' }
      });
    }
    
    // Ensure amount is a valid number
    const transactionAmount = parseInt(amount);
    if (isNaN(transactionAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount format. Must be a number.',
        details: { invalidField: 'amount', receivedValue: amount }
      });
    }
    
    // Find fund
    const fund = await CoupleFund.findOne({ _id: fundId, userId });
    
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fund not found',
        details: { fundId, userId }
      });
    }
    
    console.log('[DEBUG] Found fund:', {
      fundId: fund._id,
      name: fund.name,
      currentBalance: fund.balance
    });
    
    // Create new transaction
    const newTransaction = {
      amount: transactionAmount,
      type,
      category: category || (type === 'deposit' ? 'Income' : 'Expense'),
      description: description || '',
      date: new Date(),
      createdBy: createdBy || userId
    };
    
    console.log('[DEBUG] Created transaction object:', newTransaction);
    
    // Update balance based on transaction type
    const previousBalance = fund.balance || 0;
    
    if (type === 'deposit') {
      fund.balance = previousBalance + transactionAmount;
    } else if (type === 'withdraw' || type === 'expense') {
      if (previousBalance < transactionAmount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient funds',
          details: { currentBalance: previousBalance, requestedAmount: transactionAmount }
        });
      }
      fund.balance = previousBalance - transactionAmount;
    }
    
    console.log('[DEBUG] Updated balance:', {
      previous: previousBalance,
      change: type === 'deposit' ? transactionAmount : -transactionAmount,
      new: fund.balance
    });
    
    // Add transaction to array
    fund.transactions.push(newTransaction);
    
    try {
      await fund.save();
      console.log('[DEBUG] Successfully saved fund with new transaction');
    } catch (saveError) {
      console.error('[DEBUG] Error saving fund:', saveError);
      throw saveError;
    }
    
    // Get the server's base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Convert saved fund to response object with full image URLs
    const fundObj = fund.toObject();
    
    // Convert image paths to full URLs for response
    if (fundObj.image) {
      // Make sure image URL is absolute
      if (!fundObj.image.startsWith('http')) {
        const imagePath = fundObj.image.startsWith('/') ? fundObj.image : `/${fundObj.image}`;
        fundObj.image = `${baseUrl}${imagePath}`;
      }
    }
    
    if (fundObj.avatarUrls && fundObj.avatarUrls.length > 0) {
      fundObj.avatarUrls = fundObj.avatarUrls.map(avatar => {
        if (avatar && !avatar.startsWith('http')) {
          const avatarPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
          return `${baseUrl}${avatarPath}`;
        }
        return avatar;
      });
    }
    
    res.json({
      success: true,
      data: fundObj
    });
  } catch (error) {
    console.error('[DEBUG] Error adding transaction:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to add transaction',
      error: error.message
    });
  }
};

// Get transactions with filtering and pagination
const getTransactions = async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    const { fundId, type, category, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    if (!userId || !fundId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and fund ID are required'
      });
    }
    
    // Find fund
    const fund = await CoupleFund.findOne({ _id: fundId, userId });
    
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fund not found'
      });
    }
    
    // Filter transactions
    let filteredTransactions = [...fund.transactions];
    
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    if (category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === category);
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredTransactions = filteredTransactions.filter(
        t => new Date(t.date) >= start && new Date(t.date) <= end
      );
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total: filteredTransactions.length,
        page: parseInt(page),
        totalPages: Math.ceil(filteredTransactions.length / limit)
      }
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error.message
    });
  }
};

// Delete a fund
const deleteFund = async (req, res) => {
  try {
    console.log('[DEBUG] Attempting to delete fund:', req.params.id);
    const fundId = req.params.id;
    
    if (!fundId) {
      return res.status(400).json({
        success: false,
        message: 'Fund ID is required'
      });
    }

    // Find the fund first to get image paths
    const fund = await CoupleFund.findById(fundId);
    
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fund not found'
      });
    }

    // Delete associated images
    if (fund.image) {
      deleteImage(fund.image);
    }
    
    if (fund.avatarUrls && fund.avatarUrls.length > 0) {
      fund.avatarUrls.forEach(avatar => {
        if (avatar) deleteImage(avatar);
      });
    }

    // Delete the fund
    await fund.deleteOne();
    
    console.log('[DEBUG] Successfully deleted fund:', fundId);
    
    res.json({
      success: true,
      message: 'Fund deleted successfully',
      data: fund
    });
  } catch (error) {
    console.error('Error deleting fund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete fund',
      error: error.message
    });
  }
};

module.exports = {
  getCoupleFund,
  updateCoupleFund,
  addPartner,
  removePartner,
  addTransaction,
  getTransactions,
  deleteFund
}; 