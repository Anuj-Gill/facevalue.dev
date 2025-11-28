'use client';

import { supabaseClient } from "@/lib/supabase/client";

export default function SignInButton() {
  async function handleSignIn() {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/callback`,
        queryParams: {access_type: 'offline', prompt: 'consent'}
      }
    });
  }

  return <button onClick={handleSignIn}>Sign in with Google</button>
}