import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTikTokOAuthUrl, exchangeCodeForToken, getUserInfo } from '@/lib/tiktok/api-client';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // OAuth callback
  if (code && state) {
    try {
      const tokens = await exchangeCodeForToken(code);
      const userInfo = await getUserInfo(tokens.access_token);

      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

      await supabase.from('tiktok_accounts').upsert({
        user_id: user.id,
        tiktok_user_id: tokens.open_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        username: userInfo.username,
        display_name: userInfo.display_name,
        avatar_url: userInfo.avatar_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,tiktok_user_id' });

      return NextResponse.redirect(new URL('/tiktok/parametres?connected=true', request.url));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OAuth failed';
      return NextResponse.redirect(new URL(`/tiktok/parametres?error=${encodeURIComponent(msg)}`, request.url));
    }
  }

  if (error) {
    return NextResponse.redirect(new URL(`/tiktok/parametres?error=${encodeURIComponent(error)}`, request.url));
  }

  // Initiate OAuth
  const stateToken = crypto.randomBytes(16).toString('hex');
  const url = getTikTokOAuthUrl(stateToken);
  return NextResponse.redirect(url);
}
