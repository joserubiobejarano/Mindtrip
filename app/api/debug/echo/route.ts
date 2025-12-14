import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to test POST requests
 * Returns a simple OK response with timestamp
 * No authentication required
 * Useful for verifying that Vercel receives POST requests correctly
 */
export async function POST(req: NextRequest) {
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
  });
}
