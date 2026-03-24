import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || '';

/**
 * Validates the admin secret key from request headers.
 * Admin portal must send: x-admin-key: <ADMIN_SECRET_KEY>
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const key = request.headers.get('x-admin-key');
  if (!key || key !== ADMIN_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Invalid admin credentials' },
      { status: 403 }
    );
  }
  return null; // null = authorized, proceed
}
