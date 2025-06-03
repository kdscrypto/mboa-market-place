
/**
 * Input sanitization utilities for security
 */

// HTML entity encoding map
const HTML_ENTITIES: { [key: string]: string } = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Sanitize HTML content by encoding dangerous characters
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
};

/**
 * Sanitize text input by removing dangerous characters and limiting length
 */
export const sanitizeText = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') return '';
  
  // Remove null bytes and control characters except newlines and tabs
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace and limit length
  return cleaned.trim().slice(0, maxLength);
};

/**
 * Sanitize phone number input
 */
export const sanitizePhone = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove all non-digit characters except + and spaces
  const cleaned = input.replace(/[^\d+\s-()]/g, '');
  
  // Limit length
  return cleaned.slice(0, 20);
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Basic email sanitization - remove dangerous characters
  const cleaned = input.replace(/[<>"'&]/g, '').trim().toLowerCase();
  
  // Limit length
  return cleaned.slice(0, 254);
};

/**
 * Sanitize URL input
 */
export const sanitizeUrl = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  try {
    const url = new URL(input);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
};

/**
 * Validate and sanitize file names
 */
export const sanitizeFileName = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove dangerous characters and path traversal attempts
  const cleaned = input
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .trim();
  
  // Limit length
  return cleaned.slice(0, 255);
};

/**
 * Validate image file extensions
 */
export const isValidImageExtension = (filename: string): boolean => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return allowedExtensions.includes(extension);
};

/**
 * Validate file size
 */
export const isValidFileSize = (size: number, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size > 0 && size <= maxSizeBytes;
};

/**
 * Comprehensive ad data sanitization
 */
export interface SanitizedAdData {
  title: string;
  description: string;
  category: string;
  price: number;
  region: string;
  city: string;
  phone: string;
  whatsapp?: string;
  adType: string;
}

export const sanitizeAdData = (data: any): SanitizedAdData => {
  return {
    title: sanitizeText(data.title || '', 200),
    description: sanitizeText(data.description || '', 5000),
    category: sanitizeText(data.category || '', 50),
    price: Math.max(0, parseInt(data.price) || 0),
    region: sanitizeText(data.region || '', 100),
    city: sanitizeText(data.city || '', 100),
    phone: sanitizePhone(data.phone || ''),
    whatsapp: data.whatsapp ? sanitizePhone(data.whatsapp) : undefined,
    adType: sanitizeText(data.adType || 'standard', 50),
  };
};

/**
 * Sanitize search query parameters
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (typeof query !== 'string') return '';
  
  // Remove SQL injection attempts and dangerous characters
  const cleaned = query
    .replace(/['"`;\\]/g, '') // Remove quotes, semicolons, backslashes
    .replace(/\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|EXEC|SCRIPT)\b/gi, '') // Remove SQL keywords
    .trim();
  
  return cleaned.slice(0, 200);
};

