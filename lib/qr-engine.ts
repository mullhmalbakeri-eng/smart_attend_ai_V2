import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

// Strong secret key for QR token signing
const QR_SECRET = process.env.QR_SECRET || 'smart-attend-qr-secret-2026-strong-key';

export interface QRTokenPayload {
  uid: string; // Shortened from userId
  iat?: number;
  exp?: number;
}

/**
 * Generate QR token that expires in 30 seconds and save to database
 * @param employeeId Employee ID number
 * @returns JWT token string
 */
export async function generateQRToken(employeeId: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = new Date(now * 1000 + 30 * 1000); // 30 seconds from now
  
  const payload: QRTokenPayload = {
    uid: String(employeeId),
    iat: now,
    exp: now + 30 // 30 seconds expiration
  };

  const token = jwt.sign(payload, QR_SECRET, {
    algorithm: 'HS256'
  });

  // Save token to database
  await prisma.qrToken.create({
    data: {
      token,
      employeeId,
      expiresAt
    }
  });

  // Cleanup expired tokens
  await prisma.qrToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });

  return token;
}

/**
 * Verify QR token
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyQRToken(token: string): QRTokenPayload | null {
  try {
    const decoded = jwt.verify(token, QR_SECRET, {
      algorithms: ['HS256']
    }) as QRTokenPayload;
    
    return decoded;
  } catch (error) {
    console.error('QR Token verification failed:', error);
    return null;
  }
}

/**
 * Check if token is expired
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
 * Get remaining time in seconds
 * @param payload Decoded token payload
 * @returns Remaining seconds or 0 if expired
 */
export function getTokenRemainingTime(payload: QRTokenPayload): number {
  const now = Math.floor(Date.now() / 1000);
  const expirationTime = payload.exp;
  
  if (typeof expirationTime !== 'number') {
    return 0;
  }
  
  const remaining = expirationTime - now;
  return Math.max(0, remaining);
}
