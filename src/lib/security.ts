// Security utilities for the traceroute application

// Security: Enhanced logging with timestamps
export function securityLog(level: 'INFO' | 'WARN' | 'ERROR', message: string, metadata?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...metadata
  };
  
  if (level === 'ERROR' || level === 'WARN') {
    console.warn(`[SECURITY_${level}] ${timestamp}: ${message}`, metadata || '');
  } else {
    console.log(`[SECURITY_${level}] ${timestamp}: ${message}`, metadata || '');
  }
  
  // In production, you would send this to a security monitoring service
  // like DataDog, Splunk, or CloudWatch
}

// Security: Input validation utilities
export class SecurityValidator {
  private static readonly MAX_INPUT_LENGTH = 253;
  private static readonly MIN_INPUT_LENGTH = 3;
  
  // Comprehensive input sanitization
  static sanitizeInput(input: unknown): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    return input
      .replace(/[;&|`$(){}[\]\\<>'"]/g, '') // Shell injection chars
      .replace(/[%\x00-\x1f\x7f-\x9f]/g, '') // Control chars and URL encoding
      .replace(/\s+/g, '') // All whitespace
      .replace(/[^\w.-]/g, '') // Only allow word chars, dots, and hyphens
      .toLowerCase() // Normalize case
      .substring(0, this.MAX_INPUT_LENGTH);
  }
  
  // Check for suspicious patterns
  static containsSuspiciousPatterns(input: string): boolean {
    const suspiciousPatterns = [
      // Network-related suspicious patterns
      /localhost/i,
      /127\.0\.0\.1/,
      /0\.0\.0\.0/,
      /255\.255\.255\.255/,
      /::1/,
      /\.local$/i,
      /\.internal$/i,
      
      // System-related patterns
      /admin/i,
      /root/i,
      /sudo/i,
      /passwd/i,
      /shadow/i,
      /etc/i,
      /proc/i,
      /sys/i,
      /dev/i,
      /var/i,
      
      // Script injection patterns
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /ftp:/i,
      /<script/i,
      /eval\(/i,
      /expression\(/i,
      
      // Path traversal
      /\.\./,
      /\/\.\./,
      /\.\.\//,
      
      // SQL injection patterns
      /union\s+select/i,
      /or\s+1\s*=\s*1/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(input));
  }
  
  // Validate IP address format and security
  static isValidIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipRegex.test(ip)) {
      return false;
    }
    
    const parts = ip.split('.').map(Number);
    
    // Block private/internal IPs for security
    return !(
      (parts[0] === 10) || // 10.0.0.0/8
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
      (parts[0] === 192 && parts[1] === 168) || // 192.168.0.0/16
      (parts[0] === 127) || // 127.0.0.0/8
      (parts[0] === 169 && parts[1] === 254) || // 169.254.0.0/16
      (parts[0] === 0) || // 0.0.0.0/8
      (parts[0] >= 224) // Multicast and reserved
    );
  }
  
  // Validate domain name format and security
  static isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
    
    if (!domainRegex.test(domain)) {
      return false;
    }
    
    const labels = domain.split('.');
    
    // Must have at least 2 labels
    if (labels.length < 2) {
      return false;
    }
    
    // Check each label
    for (const label of labels) {
      if (label.length === 0 || label.length > 63) {
        return false;
      }
      if (label.startsWith('-') || label.endsWith('-')) {
        return false;
      }
    }
    
    // Block suspicious TLDs
    const suspiciousTLDs = ['local', 'internal', 'test', 'invalid', 'onion'];
    const tld = labels[labels.length - 1];
    if (suspiciousTLDs.includes(tld)) {
      return false;
    }
    
    return true;
  }
  
  // Comprehensive validation
  static validateTarget(input: unknown): { isValid: boolean; sanitized?: string; error?: string } {
    try {
      if (typeof input !== 'string') {
        return { isValid: false, error: 'Input must be a string' };
      }
      
      const trimmed = input.trim();
      
      if (trimmed.length < this.MIN_INPUT_LENGTH) {
        return { isValid: false, error: 'Input too short' };
      }
      
      if (trimmed.length > this.MAX_INPUT_LENGTH) {
        return { isValid: false, error: 'Input too long' };
      }
      
      if (this.containsSuspiciousPatterns(trimmed)) {
        securityLog('WARN', 'Suspicious pattern detected in input', { input: trimmed });
        return { isValid: false, error: 'Suspicious pattern detected' };
      }
      
      const sanitized = this.sanitizeInput(trimmed);
      
      if (this.isValidIP(sanitized)) {
        return { isValid: true, sanitized };
      }
      
      if (this.isValidDomain(sanitized)) {
        return { isValid: true, sanitized };
      }
      
      return { isValid: false, error: 'Invalid IP address or domain name format' };
      
    } catch (error: any) {
      securityLog('ERROR', 'Validation error', { error: error.message, input });
      return { isValid: false, error: 'Validation failed' };
    }
  }
}

// Security: Rate limiting utilities
export class RateLimiter {
  private static store = new Map<string, { count: number; resetTime: number }>();
  
  static checkLimit(
    identifier: string, 
    maxRequests: number = 10, 
    windowMs: number = 60 * 1000
  ): boolean {
    const now = Date.now();
    const data = this.store.get(identifier);
    
    if (!data || now > data.resetTime) {
      this.store.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (data.count >= maxRequests) {
      securityLog('WARN', 'Rate limit exceeded', { identifier, count: data.count, maxRequests });
      return false;
    }
    
    data.count++;
    return true;
  }
  
  static getRemainingRequests(identifier: string, maxRequests: number = 10): number {
    const data = this.store.get(identifier);
    if (!data || Date.now() > data.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - data.count);
  }
}

// Security: Generate secure headers
export function getSecurityHeaders(): HeadersInit {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.ipify.org https://httpbin.org http://ip-api.com https://ipinfo.io; " +
      "font-src 'self'; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
  };
}
