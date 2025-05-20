/**
 * Utility functions for handling local images
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Base directory for storing uploaded images
const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log('Created uploads directory:', UPLOAD_DIR);
}

// Generate a unique filename based on timestamp and random string
const generateUniqueFilename = (originalName = '') => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = originalName.split('.').pop() || 'jpg';
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Save a base64 image to the local filesystem
 * @param {string} base64Image - The base64 encoded image data
 * @param {string} subdirectory - Optional subdirectory to store the image in
 * @returns {string} - The relative path to the saved image
 */
const saveBase64Image = (base64Image, subdirectory = 'funds') => {
  if (!base64Image) return '';
  
  const targetDir = path.join(UPLOAD_DIR, subdirectory);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  try {
    // Remove the data:image/[type];base64, prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Create buffer from base64
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename
    const filename = generateUniqueFilename();
    
    // Create full file path
    const filePath = path.join(targetDir, filename);
    
    // Write file
    fs.writeFileSync(filePath, imageBuffer);
    
    // Return relative path for database storage
    return `uploads/${subdirectory}/${filename}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
};

/**
 * Get the full URL for an image
 * @param {string} imagePath - The relative path of the image
 * @param {object} req - Express request object
 * @returns {string} - Full URL to the image
 */
const getImageUrl = (req, relativePath) => {
  if (!relativePath) return null;
  
  // If already a full URL, return as is
  if (relativePath.startsWith('http')) {
    return relativePath;
  }
  
  // Construct full URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imagePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${baseUrl}${imagePath}`;
};

// Delete image file
const deleteImage = (relativePath) => {
  try {
    if (!relativePath) return;
    
    // Only delete if it's a local file
    if (!relativePath.startsWith('http')) {
      const fullPath = path.join(__dirname, '../..', relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

module.exports = {
  saveBase64Image,
  getImageUrl,
  deleteImage,
  UPLOAD_DIR
}; 