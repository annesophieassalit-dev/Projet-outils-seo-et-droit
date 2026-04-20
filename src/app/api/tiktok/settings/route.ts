import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: settings } = await supabase
    .from('tiktok_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: account } = await supabase
    .from('tiktok_accounts')
    .select('id, username, display_name, avatar_url, token_expires_at')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({ settings, account });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();

  const { error } = await supabase
    .from('tiktok_settings')
    .upsert({
      user_id: user.id,
      auto_publish: body.auto_publish ?? false,
      post_times: body.post_times ?? ['09:00', '18:00'],
      timezone: body.timezone ?? 'Europe/Paris',
      daily_carousel_count: body.daily_carousel_count ?? 2,
      daily_video_count: body.daily_video_count ?? 1,
      auto_generate: body.auto_generate ?? true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
