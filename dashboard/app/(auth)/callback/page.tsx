'use client';
import { useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { LoaderThree } from '@/components/ui/loader';

// Helper to parse JWT token
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Helper to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const minLoaderTime = new Promise(resolve => setTimeout(resolve, 3000));

    async function handleCallback() {
      try {
        // Get session from Supabase
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          return;
        }

        if (session) {
          console.log('Session established:', session);

          // Send tokens to backend
          try {
            const response = await axios.post(
              'http://localhost:4000/oauth/register',
              {
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                withCredentials: true, // Important: to receive cookies
              }
            );

            console.log('Backend response:', response.data);

            // Parse JWT from access-token cookie and store user metadata
            const accessToken = getCookie('access-token');
            if (accessToken) {
              const jwtData = parseJwt(accessToken);
              if (jwtData?.user_metadata) {
                const { avatar_url, full_name, email, name } = jwtData.user_metadata;
                localStorage.setItem('user_avatar_url', avatar_url || '');
                localStorage.setItem('user_full_name', full_name || name || '');
                localStorage.setItem('user_email', email || '');
              }
            }

            // await supabaseClient.auth.signOut();

            // Wait for minimum loader time before redirecting
            await minLoaderTime;

            // Redirect to dashboard
            router.push('/dashboard');

          } catch (apiError) {
            console.error('API error:', apiError);
          }
        } else {
          console.log('No session found');
        }
      } catch (e) {
        console.error('Callback error:', e);
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="bg-background flex min-h-svh items-center justify-center">
      <LoaderThree />
    </div>
  );
}