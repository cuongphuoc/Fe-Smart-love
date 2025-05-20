const CoupleFund = require('../models/coupleFund');
const { saveBase64Image, getImageUrl } = require('../utils/imageHelper');

// Get all couple funds for a user
const getCoupleFund = async (req, res) => {
  try {
    console.log('[DEBUG] Đang lấy couple funds...');
    const userId = req.headers['user-id']; // Get userId from request headers
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find all funds for the user
    const funds = await CoupleFund.find({ userId }).sort({ updatedAt: -1 });
    
    console.log('[DEBUG] Số lượng funds tìm thấy:', funds.length);
    
    // Process funds without image processing
    const processedFunds = funds.map(fund => {
      const fundObj = fund.toObject();
      
      // Keep only essential data
      return {
        _id: fundObj._id,
        name: fundObj.name,
        description: fundObj.description,
        balance: fundObj.balance,
        goal: fundObj.goal,
        partners: fundObj.partners,
        transactions: fundObj.transactions,
        createdAt: fundObj.createdAt,
        updatedAt: fundObj.updatedAt,
        lastSync: new Date().toISOString() // Add sync timestamp
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
    const userId = req.headers['user-id']; // Get userId from request headers
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
    
    // Process any images that might be in base64 format
    let processedImage = image;
    let processedAvatars = avatarUrls;
    
    // Only process image if it's a base64 string
    if (image && typeof image === 'string' && image.startsWith('data:image')) {
      processedImage = saveBase64Image(image, 'funds');
      console.log('[DEBUG] Saved fund image:', processedImage);
    }
    
    // Process avatar images
    if (avatarUrls && Array.isArray(avatarUrls)) {
      processedAvatars = avatarUrls.map((avatar, index) => {
        if (avatar && typeof avatar === 'string' && avatar.startsWith('data:image')) {
          return saveBase64Image(avatar, 'avatars');
        }
        return avatar;
      });
    }
    
    if (id) {
      // Update existing fund
      fund = await CoupleFund.findOne({ _id: id, userId });
      
      if (!fund) {
        return res.status(404).json({
          success: false,
          message: 'Fund not found'
        });
      }
      
      // Update fund details
      if (name) fund.name = name;
      if (description) fund.description = description;
      if (processedImage) fund.image = processedImage;
      if (processedAvatars && processedAvatars.length > 0) fund.avatarUrls = processedAvatars;
      if (goal) fund.goal = { ...fund.goal, ...goal };
      
      // Handle balance update through a transaction
      if (typeof balance !== 'undefined') {
        const currentBalance = fund.balance || 0;
        const newBalance = parseInt(balance);
        
        if (newBalance !== currentBalance) {
          // Create a transaction for the balance difference
          const difference = newBalance - currentBalance;
          const transactionType = difference > 0 ? 'deposit' : 'withdraw';
          
          // Add transaction record
          fund.transactions.push({
            amount: Math.abs(difference),
            type: transactionType,
            category: transactionType === 'deposit' ? 'Income' : 'Expense',
            description: `${transactionType === 'deposit' ? 'Added' : 'Withdrew'} ${Math.abs(difference)}đ`,
            date: new Date(),
            createdBy: 'User'
          });
          
          // Update balance
          fund.balance = newBalance;
        }
      }
      
      if (partners) fund.partners = partners;
    } else {
      // Create new fund
      fund = new CoupleFund({
        userId,
        name: name || 'Our Fund',
        description: description || "Let's create goals and make dreams come true",
        image: processedImage,
        avatarUrls: processedAvatars || [],
        balance: balance || 0,
        partners: partners || [],
        goal: goal || {},
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Save to database
    await fund.save();
    console.log('[DEBUG] Đã lưu fund vào database');
    
    // Get the server's base URL for image paths
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    console.log('[DEBUG] Server base URL:', baseUrl);
    
    // Convert saved fund to response object with full image URLs
    const fundObj = fund.toObject();
    
    // Convert image paths to full URLs for response
    if (fundObj.image) {
      // Make sure image URL is absolute
      if (!fundObj.image.startsWith('http')) {
        const imagePath = fundObj.image.startsWith('/') ? fundObj.image : `/${fundObj.image}`;
        fundObj.image = `${baseUrl}${imagePath}`;
      }
      console.log('[DEBUG] Image URL:', fundObj.image);
    }
    
    if (fundObj.avatarUrls && fundObj.avatarUrls.length > 0) {
      fundObj.avatarUrls = fundObj.avatarUrls.map(avatar => {
        if (avatar && !avatar.startsWith('http')) {
          const avatarPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
          return `${baseUrl}${avatarPath}`;
        }
        return avatar;
      });
      console.log('[DEBUG] Avatar URLs:', fundObj.avatarUrls);
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
    
    if (!userId || !fundId || !amount || !type || !category || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'User ID, fund ID, amount, type, category, and createdBy are required'
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
    
    // Create new transaction
    const newTransaction = {
      amount,
      type,
      category,
      description: description || '',
      date: new Date(),
      createdBy
    };
    
    // Update balance based on transaction type
    if (type === 'deposit') {
      fund.balance += amount;
      
      // Update partner contribution
      const partner = fund.partners.find(p => p.name === createdBy);
      if (partner) {
        partner.contribution += amount;
      }
    } else if (type === 'withdraw' || type === 'expense') {
      if (fund.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient funds'
        });
      }
      fund.balance -= amount;
    }
    
    // Add transaction to array
    fund.transactions.push(newTransaction);
    await fund.save();
    
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
    console.error('Error adding transaction:', error);
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
    const userId = req.headers['user-id'];
    const fundId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!fundId) {
      return res.status(400).json({
        success: false,
        message: 'Fund ID is required'
      });
    }

    // Find and delete the fund
    const fund = await CoupleFund.findOneAndDelete({ _id: fundId, userId });
    
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Fund not found or you do not have permission to delete it'
      });
    }

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