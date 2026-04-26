'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Public OAuth client id (safe to ship); override with NEXT_PUBLIC_GOOGLE_CLIENT_ID for staging.
const DEFAULT_WEB_CLIENT_ID =
  '631574178472-imq0mlh3hopqmpnac68f3i8hhiqjb9jc.apps.googleusercontent.com';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_WEB_CLIENT_ID;

export default function Providers({ children }) {
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}
