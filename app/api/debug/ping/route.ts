import { NextResponse } from 'next/server';

/**
 * Debug endpoint to test GET requests
 * Returns a simple OK response with timestamp
 * No authentication required
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
  });
}
