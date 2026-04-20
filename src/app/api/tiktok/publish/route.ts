import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content_id, schedule_at } = await request.json();

  // Fetch content
  const { data: content, error: fetchErr } = await supabase
    .from('tiktok_content')
    .select('*, tiktok_accounts(*)')
    .eq('id', content_id)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  // Schedule for later
  if (schedule_at) {
    const { error } = await supabase
      .from('tiktok_content')
      .update({ status: 'scheduled', scheduled_at: schedule_at })
      .eq('id', content_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, scheduled_at: schedule_at });
  }

  // Publish immediately
  try {
    const account = (content as { tiktok_accounts?: { access_token?: string } | null }).tiktok_accounts;
    if (!account?.access_token) {
      return NextResponse.json({ error: 'Aucun compte TikTok connecté' }, { status: 400 });
    }

    const publicImageUrls = (content.image_urls as string[]).filter((url: string) => url.startsWith('http'));
    if (publicImageUrls.length === 0) {
      return NextResponse.json({ error: 'Les images doivent être hébergées publiquement pour publier sur TikTok' }, { status: 400 });
    }

    const { initPhotoPost } = await import('@/lib/tiktok/api-client');
    const caption = `${content.caption}\n\n${(content.hashtags as string[]).join(' ')}`;
    const { publish_id } = await initPhotoPost(account.access_token, publicImageUrls, caption);

    await supabase
      .from('tiktok_content')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        tiktok_post_id: publish_id,
      })
      .eq('id', content_id);

    return NextResponse.json({ success: true, publish_id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Publish failed';
    await supabase
      .from('tiktok_content')
      .update({ status: 'failed', error_message: message })
      .eq('id', content_id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
