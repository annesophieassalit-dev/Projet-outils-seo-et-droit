import { createClient } from '@/lib/supabase/server';
import { generateDailyContent } from './content-generator';
import { generateSlideImages } from './image-generator';
import type { TikTokContent, TikTokSettings } from '@/types/tiktok';

function getTodaySlots(settings: TikTokSettings): Date[] {
  const now = new Date();
  return settings.post_times.map((time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const slot = new Date(now);
    slot.setHours(hours, minutes, 0, 0);
    return slot;
  });
}

export async function scheduleDailyContent(userId: string): Promise<{ scheduled: number; errors: string[] }> {
  const supabase = await createClient();
  const errors: string[] = [];
  let scheduled = 0;

  const { data: settings } = await supabase
    .from('tiktok_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!settings) {
    errors.push('No TikTok settings found for user');
    return { scheduled, errors };
  }

  // Check existing scheduled content for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: existing } = await supabase
    .from('tiktok_content')
    .select('id')
    .eq('user_id', userId)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString());

  if (existing && existing.length >= settings.post_times.length) {
    return { scheduled: 0, errors: ['Content already scheduled for today'] };
  }

  // Generate content
  const contents = await generateDailyContent(userId);
  const slots = getTodaySlots(settings);

  for (let i = 0; i < Math.min(contents.length, slots.length); i++) {
    const content = contents[i];
    const slot = slots[i];

    if (slot <= new Date()) continue; // Skip past slots

    const images = generateSlideImages(content.slides, `draft_${Date.now()}_${i}`);

    const { error } = await supabase.from('tiktok_content').insert({
      user_id: userId,
      content_type: content.content_type,
      status: settings.auto_publish ? 'scheduled' : 'draft',
      pillar: content.pillar,
      title: content.title,
      hook: content.hook,
      slides: content.slides,
      caption: content.caption,
      hashtags: content.hashtags,
      scheduled_at: settings.auto_publish ? slot.toISOString() : null,
      image_urls: images.map((img) => img.dataUrl),
    });

    if (error) {
      errors.push(`Failed to save content ${i + 1}: ${error.message}`);
    } else {
      scheduled++;
    }
  }

  return { scheduled, errors };
}

export async function publishDueContent(): Promise<{ published: number; errors: string[] }> {
  const supabase = await createClient();
  const errors: string[] = [];
  let published = 0;

  const now = new Date();
  const { data: dueContent } = await supabase
    .from('tiktok_content')
    .select('*, tiktok_accounts(*)')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now.toISOString())
    .limit(10);

  if (!dueContent || dueContent.length === 0) {
    return { published, errors };
  }

  for (const content of dueContent) {
    try {
      await publishContent(content as TikTokContent & { tiktok_accounts: { access_token: string } });
      published++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to publish ${content.id}: ${msg}`);

      await supabase
        .from('tiktok_content')
        .update({ status: 'failed', error_message: msg })
        .eq('id', content.id);
    }
  }

  return { published, errors };
}

async function publishContent(content: TikTokContent & { tiktok_accounts?: { access_token: string } | null }): Promise<void> {
  const { initPhotoPost } = await import('./api-client');
  const supabase = await createClient();

  if (!content.tiktok_accounts?.access_token) {
    throw new Error('No TikTok account connected');
  }

  const caption = `${content.caption}\n\n${content.hashtags.join(' ')}`;

  // For carousel posts, use image URLs (must be publicly accessible)
  const publicImageUrls = content.image_urls.filter((url) => url.startsWith('http'));

  if (publicImageUrls.length === 0) {
    throw new Error('No public image URLs available for posting');
  }

  const { publish_id } = await initPhotoPost(
    content.tiktok_accounts.access_token,
    publicImageUrls,
    caption,
  );

  await supabase
    .from('tiktok_content')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      tiktok_post_id: publish_id,
    })
    .eq('id', content.id);
}
