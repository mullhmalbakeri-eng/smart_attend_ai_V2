import jwt from 'jsonwebtoken';

// Secret key for QR token generation (in production, use environment variable)
const QR_SECRET_KEY = process.env.QR_SECRET_KEY || 'smart-attend-qr-secret-key-2024';

export interface QRTokenPayload {
  employeeId: number;
  name: string;
  email: string;
  department: string;
  timestamp: number;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for QR code with 10-second expiration
 * @param payload Employee data to encode
 * @returns JWT token string
 */
export function generateQRToken(payload: Omit<QRTokenPayload, 'timestamp' | 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  
  const tokenPayload: QRTokenPayload = {
    ...payload,
    timestamp: now,
    iat: now,
    exp: now + 10 // 10 seconds expiration
  };

  return jwt.sign(tokenPayload, QR_SECRET_KEY, {
    algorithm: 'HS256'
  });
}

/**
 * Verify and decode QR token
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyQRToken(token: string): QRTokenPayload | null {
  try {
    const decoded = jwt.verify(token, QR_SECRET_KEY, {
      algorithms: ['HS256']
    }) as QRTokenPayload;
    
    return decoded;
  } catch (error) {
    console.error('QR Token verification failed:', error);
    return null;
  }
}

/**
 * Check if QR token is expired
 * @param payload Decoded token payload
 * @returns boolean indicating if token is expired
 */
export function isQRTokenExpired(payload: QRTokenPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  const expirationTime = payload.exp;
  
  if (typeof expirationTime !== 'number') {
    return true; // Treat missing or invalid exp as expired
  }
  
  return expirationTime < now;
}

/**
 * Generate QR data string for encoding
 * @param employee Employee data
 * @returns JSON string for QR code
 */
export function generateQRData(employee: {
  id: number;
  name: string;
  email: string;
  department: string;
}): string {
  const token = generateQRToken({
    employeeId: employee.id,
    name: employee.name,
    email: employee.email,
    department: employee.department
  });

  return JSON.stringify({
    token,
    type: 'smart-attend-qr',
    version: '1.0'
  });
}

/**
 * Parse and verify QR data string
 * @param qrData QR data string
 * @returns Employee data or null if invalid
 */
export function parseQRData(qrData: string): {
  employeeId: number;
  name: string;
  email: string;
  department: string;
} | null {
  try {
    const parsed = JSON.parse(qrData);
    
    // Verify it's our QR format
    if (parsed.type !== 'smart-attend-qr' || !parsed.token) {
      return null;
    }

    // Verify the token
    const payload = verifyQRToken(parsed.token);
    if (!payload) {
      return null;
    }

    // Check if token is expired
    if (isQRTokenExpired(payload)) {
      return null;
    }

    return {
      employeeId: payload.employeeId,
      name: payload.name,
      email: payload.email,
      department: payload.department
    };
  } catch (error) {
    console.error('Failed to parse QR data:', error);
    return null;
  }
}
