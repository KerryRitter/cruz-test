import { createTRPCHooks, createTRPCClientFactory, createDefaultQueryClient, registerTRPC } from '@cruzjs/core/trpc/client';
import { registerOrgTRPC } from '@cruzjs/start/orgs/org.hooks';
import type { AppRouter } from './router';

export const trpc = createTRPCHooks<AppRouter>();

registerTRPC(trpc);
registerOrgTRPC(trpc as any);

export const createTRPCClient = () => createTRPCClientFactory(trpc);

export const createQueryClient = createDefaultQueryClient;
