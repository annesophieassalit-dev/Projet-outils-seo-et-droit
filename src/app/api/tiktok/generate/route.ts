import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCarousel, generateVideoScript, generateTopics } from '@/lib/tiktok/content-generator';
import { generateSlideImages } from '@/lib/tiktok/image-generator';
import type { ContentType, Pillar } from '@/types/tiktok';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { action, topic, content_type, pillar, count } = body;

  try {
    if (action === 'generate_topics') {
      const topics = await generateTopics(count || 10);
      await supabase.from('tiktok_topics').insert(
        topics.map((t) => ({ ...t, user_id: user.id, used: false }))
      );
      return NextResponse.json({ topics });
    }

    if (action === 'generate_content') {
      const topicData = { title: topic, pillar: (pillar || 'general') as Pillar, hook: undefined };
      const contentType = (content_type || 'carousel') as ContentType;

      const generated = contentType === 'video_long'
        ? await generateVideoScript(topicData)
        : await generateCarousel(topicData);

      const tempId = `draft_${Date.now()}`;
      const images = generateSlideImages(generated.slides, tempId);

      const { data: saved, error } = await supabase
        .from('tiktok_content')
        .insert({
          user_id: user.id,
          content_type: generated.content_type,
          status: 'draft',
          pillar: generated.pillar,
          title: generated.title,
          hook: generated.hook,
          slides: generated.slides,
          caption: generated.caption,
          hashtags: generated.hashtags,
          image_urls: images.map((img) => img.dataUrl),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return NextResponse.json({ content: saved, images });
    }

    if (action === 'generate_daily') {
      const { scheduleDailyContent } = await import('@/lib/tiktok/scheduler');
      const result = await scheduleDailyContent(user.id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
