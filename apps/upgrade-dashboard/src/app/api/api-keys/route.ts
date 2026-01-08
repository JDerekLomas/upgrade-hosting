import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { createHash, randomBytes } from 'crypto';

const sql = neon(process.env.PLATFORM_DATABASE_URL!);

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check user role (only admin/owner can create keys)
  if (!['owner', 'admin'].includes(session.user.role || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  // Generate API key
  const randomPart = randomBytes(24).toString('base64url');
  const plainKey = `upg_live_${randomPart}`;
  const keyPrefix = `upg_live_${randomPart.slice(0, 4)}`;
  const keyHash = createHash('sha256').update(plainKey).digest('hex');

  try {
    await sql`
      INSERT INTO api_keys (
        tenant_id,
        key_prefix,
        key_hash,
        name,
        scopes,
        rate_limit_per_minute,
        created_by
      ) VALUES (
        ${session.user.tenantId},
        ${keyPrefix},
        ${keyHash},
        ${name},
        ARRAY['sdk:read', 'sdk:write'],
        1000,
        ${session.user.userId}
      )
    `;

    return NextResponse.json({
      plainKey,
      keyPrefix,
      message: 'API key created successfully',
    });
  } catch (error) {
    console.error('Failed to create API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!['owner', 'admin'].includes(session.user.role || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get('id');

  if (!keyId) {
    return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
  }

  try {
    // Soft delete - just mark as inactive
    await sql`
      UPDATE api_keys
      SET is_active = false
      WHERE id = ${keyId}
        AND tenant_id = ${session.user.tenantId}
    `;

    return NextResponse.json({ message: 'API key revoked' });
  } catch (error) {
    console.error('Failed to revoke API key:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
