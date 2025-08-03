const bcrypt = require('bcryptjs');

class PasswordUtils {
  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  static async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(12);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error('Error hashing password');
    }
  }

  /**
   * Compare a plain text password with a hashed password
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} - True if passwords match
   */
  static async comparePasswords(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error('Error comparing passwords');
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} - Validation result with isValid and errors
   */
  static validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 128) {
      errors.push('Password cannot exceed 128 characters');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push(
        'Password must contain at least one special character (@$!%*?&)'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a random password
   * @param {number} length - Password length (default: 12)
   * @returns {string} - Generated password
   */
  static generateRandomPassword(length = 12) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '@$!%*?&';
    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}

module.exports = PasswordUtils;
