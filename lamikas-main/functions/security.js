const validator = require('validator');
const sanitizeHtml = require('sanitize-html');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter for API endpoints
const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 1, // per 1 second per IP
});

// Input validation and sanitization
class SecurityUtils {
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
  }

  static sanitizeObject(obj) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  static validateEmail(email) {
    return validator.isEmail(email);
  }

  static validatePhone(phone) {
    return validator.isMobilePhone(phone.replace(/[^\d+]/g, ''), 'any', { strictMode: false });
  }

  static async checkRateLimit(ip) {
    try {
      await rateLimiter.consume(ip);
      return true;
    } catch (error) {
      return false;
    }
  }

  static generateCSRFToken() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  static validateCSRFToken(token, storedToken) {
    return token && storedToken && token === storedToken;
  }
}

module.exports = SecurityUtils;
