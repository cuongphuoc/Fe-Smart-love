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
    // Check if it's a data URI
    if (base64Image.includes('data:image')) {
      const matches = base64Image.match(/^data:image\/([A-Za-z]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        console.warn('Invalid base64 image format');
        return base64Image;
      }
      
      const fileType = matches[1];
      const base64Data = matches[2];
      const fileName = `${crypto.randomBytes(16).toString('hex')}.${fileType}`;
      const filePath = path.join(targetDir, fileName);
      
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      console.log(`Saved image to ${filePath}`);
      
      // Return path relative to uploads directory for storage in database
      return `/uploads/${subdirectory}/${fileName}`;
    }
    
    // Return the original path if not a base64 image
    return base64Image;
  } catch (error) {
    console.error('Error saving image:', error);
    return '';
  }
};

/**
 * Get the full URL for an image
 * @param {string} imagePath - The relative path of the image
 * @param {object} req - Express request object
 * @returns {string} - Full URL to the image
 */
const getImageUrl = (imagePath, req) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Construct the full URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

module.exports = {
  saveBase64Image,
  getImageUrl,
  UPLOAD_DIR
}; 