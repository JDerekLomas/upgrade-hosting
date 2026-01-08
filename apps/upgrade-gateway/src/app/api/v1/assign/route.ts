import { createGatewayHandler, extractUserIdFromBody } from '@/lib/gateway-handler';

export const runtime = 'edge';

const handler = createGatewayHandler({
  endpoint: '/api/v6/assign',
  requiredScope: 'sdk:read',
  extractUserId: extractUserIdFromBody,
});

export const POST = handler;
export const GET = handler;
export const OPTIONS = handler;
