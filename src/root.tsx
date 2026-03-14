import { CruzProviders } from '@cruzjs/core/framework/components';
import { trpc, createTRPCClient, createQueryClient } from '@/trpc/client';
import { appConfig } from '@/config/app.config';
import { theme } from '@/theme';
import { Link, useNavigate } from 'react-router';

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from 'react-router';

import './index.css';

function Navbar() {
  const navigate = useNavigate();
  const { data: session } = trpc.auth.session.useQuery(undefined, { retry: false });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => navigate('/'),
  });

  const isLoggedIn = !!session?.user;
  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Account';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 h-12">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
          </svg>
          {appConfig.name}
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
            Home
          </Link>
          <Link to="/subreddits" className="px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
            Communities
          </Link>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link
                to="/subreddits/create"
                className="hidden md:block px-3 py-1.5 text-sm text-slate-700 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors"
              >
                Create Community
              </Link>
              <span className="text-sm text-slate-600 font-medium hidden md:block">{displayName}</span>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="px-4 py-1.5 text-sm text-slate-700 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="px-4 py-1.5 text-sm text-indigo-700 border border-indigo-300 rounded-full hover:bg-indigo-50 transition-colors font-medium"
              >
                Log In
              </Link>
              <Link
                to="/auth/register"
                className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
        <title>{appConfig.name}</title>
      </head>
      <body className="min-h-screen bg-slate-50 text-gray-900">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <CruzProviders
      trpc={trpc}
      createClient={createTRPCClient}
      createQueryClient={createQueryClient}
      theme={theme}
    >
      <Navbar />
      <div className="pt-12">
        <Outlet />
      </div>
    </CruzProviders>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{message}</h1>
      <p className="mt-2 text-gray-600">{details}</p>
      {stack && (
        <pre className="mt-4 p-4 bg-gray-100 overflow-x-auto text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
