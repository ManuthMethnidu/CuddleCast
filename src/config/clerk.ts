export const CLERK_PUBLISHABLE_KEY: string =
  (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) ||
  (import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string) ||
  'pk_test_Y3J1Y2lhbC1zdGlua2J1Zy0xNzQ4LmNsZXJrLmFjY291bnRzLmRldiQ';
