// Setup MUST be imported first - configures database schema
import { userProviders } from '@/setup.server';

import { handleTRPCRequest } from '@cruzjs/core/trpc/handler';
import { withLoaderMiddleware, withActionMiddleware } from '@cruzjs/core/routing/middleware';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

export const loader = async (args: LoaderFunctionArgs) =>
  withLoaderMiddleware([args], async ({ request, params }) => {
    return handleTRPCRequest(request, params, userProviders);
  });

export const action = async (args: ActionFunctionArgs) =>
  withActionMiddleware([args], async ({ request, params }) => {
    return handleTRPCRequest(request, params, userProviders);
  });
