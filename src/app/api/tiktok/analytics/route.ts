import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: content } = await supabase
    .from('tiktok_content')
    .select('id, content_type, pillar, status, title, hook, views_count, likes_count, shares_count, comments_count, published_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!content) return NextResponse.json({ stats: {}, content: [] });

  const published = content.filter((c) => c.status === 'published');
  const totalViews = published.reduce((sum, c) => sum + (c.views_count || 0), 0);
  const totalLikes = published.reduce((sum, c) => sum + (c.likes_count || 0), 0);
  const totalShares = published.reduce((sum, c) => sum + (c.shares_count || 0), 0);

  // Best performing content
  const topContent = [...published]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5);

  // Pillar performance
  const pillarStats = published.reduce<Record<string, { views: number; count: number }>>((acc, c) => {
    if (!acc[c.pillar]) acc[c.pillar] = { views: 0, count: 0 };
    acc[c.pillar].views += c.views_count || 0;
    acc[c.pillar].count++;
    return acc;
  }, {});

  return NextResponse.json({
    stats: {
      total_content: content.length,
      published_count: published.length,
      draft_count: content.filter((c) => c.status === 'draft').length,
      scheduled_count: content.filter((c) => c.status === 'scheduled').length,
      total_views: totalViews,
      total_likes: totalLikes,
      total_shares: totalShares,
      avg_views: published.length ? Math.round(totalViews / published.length) : 0,
    },
    top_content: topContent,
    pillar_stats: pillarStats,
    recent_content: content.slice(0, 20),
  });
}
