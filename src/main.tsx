import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/react';
import { dark } from '@clerk/themes';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Clerk publishable key with fallback to ensure production never crashes even if Vercel env var is omitted
const PUBLISHABLE_KEY =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string) ||
  'pk_test_Y3J1Y2lhbC1zdGlua2J1Zy0xNzQ4LmNsZXJrLmFjY291bnRzLmRldiQ';

// TanStack Query Client for caching server state and avoiding React context repaint lag
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache validity
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection time
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppRoot = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: '#2185D5',
          colorBackground: '#303841',
        },
      }}
      afterSignOutUrl="/"
    >
      <AppRoot />
    </ClerkProvider>
  </React.StrictMode>
);
