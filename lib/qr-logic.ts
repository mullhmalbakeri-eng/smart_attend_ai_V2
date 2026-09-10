import jwt from 'jsonwebtoken';
import { QRCodeSVG } from 'qrcode.react';

// Secret key for QR token generation (in production, use environment variable)
const QR_SECRET_KEY = process.env.QR_SECRET_KEY || 'smart-attend-qr-secret-key-2026';

export interface QRTokenPayload {
  employeeId: number;
  name: string;
  email: string;
  department: string;
  timestamp: number;
  iat?: number;
  exp?: number;
}

export interface EmployeeData {
  id: number;
  name: string;
  email: string;
  department: string;
}

/**
 * Generate a JWT token for QR code with 10-second expiration
 * @param payload Employee data to encode
 * @returns JWT token string
 */
export function signAttendanceToken(payload: Omit<QRTokenPayload, 'timestamp' | 'iat' | 'exp'>): string {
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
export function verifyAttendanceToken(token: string): QRTokenPayload | null {
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
export function isTokenExpired(payload: QRTokenPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  const expirationTime = payload.exp;
  
  if (typeof expirationTime !== 'number') {
    return true; // Treat missing or invalid exp as expired
  }
  
  return expirationTime < now;
}

/**
 * Generate QR code SVG with signed token
 * @param employee Employee data
 * @returns QR code SVG string
 */
export function generateAttendanceQR(employee: EmployeeData): string {
  const token = signAttendanceToken({
    employeeId: employee.id,
    name: employee.name,
    email: employee.email,
    department: employee.department
  });

  const qrData = JSON.stringify({
    token,
    type: 'smart-attend-qr',
    version: '1.0',
    generatedAt: new Date().toISOString()
  });

  return qrData;
}

/**
 * Parse and verify QR data string
 * @param qrData QR data string
 * @returns Employee data or null if invalid
 */
export function parseAttendanceQR(qrData: string): { employeeId: number; name: string; email: string; department: string } | null {
  try {
    const parsed = JSON.parse(qrData);
    
    // Verify it's our QR format
    if (parsed.type !== 'smart-attend-qr' || !parsed.token) {
      return null;
    }

    // Verify token
    const payload = verifyAttendanceToken(parsed.token);
    if (!payload) {
      return null;
    }

    // Check if token is expired
    if (isTokenExpired(payload)) {
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

/**
 * Generate QR code React component
 * @param employee Employee data
 * @returns QRCodeSVG component props
 */
export function generateQRComponent(employee: EmployeeData) {
  const qrData = generateAttendanceQR(employee);
  
  return {
    value: qrData,
    size: 256,
    level: 'H' as const,
    includeMargin: true,
    bgColor: '#FFFFFF',
    fgColor: '#000000'
  };
}

/**
 * Validate QR data for attendance scanning
 * @param qrData Raw QR data string
 * @returns Validation result with employee data or error
 */
export function validateQRForAttendance(qrData: string): {
  valid: boolean;
  employee?: EmployeeData;
  error?: string;
} {
  const employeeData = parseAttendanceQR(qrData);
  
  if (!employeeData) {
    return {
      valid: false,
      error: 'Invalid QR code format or expired token'
    };
  }
  
  return {
    valid: true,
    employee: {
      id: employeeData.employeeId,
      name: employeeData.name,
      email: employeeData.email,
      department: employeeData.department
    }
  };
}
