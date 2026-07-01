const fs = require('fs');
const path = require('path');

/**
 * File Storage provider abstraction.
 * Allows switching local filesystem storage to Cloudinary, AWS S3, or Cloudflare R2
 * in the future without changing business logic code.
 */
class StorageService {
  constructor(provider = 'local') {
    this.provider = provider;
    this.uploadDir = path.join(__dirname, '../../uploads');
    
    if (this.provider === 'local') {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    }
  }

  /**
   * Upload binary buffer to target storage provider.
   * 
   * @param {string} fileName 
   * @param {Buffer} fileBuffer 
   * @returns {Promise<string>} Public file url
   */
  async uploadFile(fileName, fileBuffer) {
    if (this.provider === 'local') {
      const filePath = path.join(this.uploadDir, fileName);
      fs.writeFileSync(filePath, fileBuffer);
      return `/uploads/${fileName}`;
    }
    
    // Future S3/Cloudinary configuration hooks:
    // if (this.provider === 'cloudinary') { ... }
    
    throw new Error(`Unsupported storage provider: ${this.provider}`);
  }

  /**
   * Remove binary from storage provider.
   * 
   * @param {string} fileName 
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(fileName) {
    if (this.provider === 'local') {
      const filePath = path.join(this.uploadDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    }
    throw new Error(`Unsupported storage provider: ${this.provider}`);
  }
}

module.exports = new StorageService('local'); // default local provider for production launch
