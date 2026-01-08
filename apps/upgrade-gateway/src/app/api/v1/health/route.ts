import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'upgrade-gateway',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
}
