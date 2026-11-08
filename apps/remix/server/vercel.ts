import handle from 'hono-react-router-adapter/node';

// The React Router Vite plugin supplies the server build at compilation time.
import * as build from 'virtual:react-router/server-build';
import type { AppLoadContext } from 'react-router';

import { getLoadContext } from './load-context';
import server from './router';

/**
 * Vercel's React Router runtime requires a Fetch-compatible entrypoint.
 * Pass requests through Documenso's Hono server so its middleware,
 * API routes, auth and CSP context execute before React Router SSR.
 */
const handler = handle(build, server, {
  getLoadContext: async () => getLoadContext() as unknown as AppLoadContext,
});

export default function fetch(request: Request) {
  return handler.fetch(request);
}
