import { createGatewayHandler, extractUserIdFromBody } from '@/lib/gateway-handler';

export const runtime = 'edge';

const handler = createGatewayHandler({
  endpoint: '/api/v6/log',
  requiredScope: 'sdk:write',
  extractUserId: extractUserIdFromBody,
});

export const POST = handler;
export const OPTIONS = handler;
