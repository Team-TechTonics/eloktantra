import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-eloktantra-secret-32-chars';

export interface JWTPayload {
  userId: string;
  phone: string;
  constituency: string;
  role?: string;
}

/**
 * ISSUANCE: Generates a cryptographically signed identity token.
 */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * VERIFICATION: Validates the token and extracts the payload.
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
}

/**
 * PROTECTED HANDLER: Extracts and verifies JWT from headers.
 */
export async function authenticate(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}
