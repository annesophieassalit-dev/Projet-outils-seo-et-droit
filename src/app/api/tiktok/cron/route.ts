import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scheduleDailyContent, publishDueContent } from '@/lib/tiktok/scheduler';

// Called by Vercel Cron or external scheduler (e.g. every 30 minutes)
// Configure in vercel.json:
// { "crons": [{ "path": "/api/tiktok/cron", "schedule": "*/30 * * * *" }] }

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  // Get all users with auto_generate enabled
  const { data: settingsList } = await supabase
    .from('tiktok_settings')
    .select('user_id, auto_generate, auto_publish')
    .eq('auto_generate', true);

  if (!settingsList || settingsList.length === 0) {
    return NextResponse.json({ message: 'No users with auto-generate enabled' });
  }

  const results: Record<string, unknown>[] = [];

  // Check if it's a generation slot (run once per day at ~7am)
  const now = new Date();
  const isGenerationSlot = now.getHours() === 7 && now.getMinutes() < 30;

  if (isGenerationSlot) {
    for (const settings of settingsList) {
      const result = await scheduleDailyContent(settings.user_id);
      results.push({ userId: settings.user_id, action: 'generate', ...result });
    }
  }

  // Always check for due publications
  const publishResult = await publishDueContent();
  results.push({ action: 'publish', ...publishResult });

  return NextResponse.json({ success: true, results });
}
