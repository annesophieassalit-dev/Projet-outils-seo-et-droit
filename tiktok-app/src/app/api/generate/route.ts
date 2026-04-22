import { NextRequest, NextResponse } from 'next/server';
import { generateContent, generateTopicsAndContent } from '@/lib/generator';
import { slidesToSvgs } from '@/lib/svg';
import type { ContentType, Pillar } from '@/types/content';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, type, pillar, topic } = body;

  try {
    if (action === 'generate_daily') {
      const contents = await generateTopicsAndContent();
      const withSvgs = contents.map((c) => ({
        ...c,
        image_svgs: slidesToSvgs(c.slides),
      }));
      return NextResponse.json({ contents: withSvgs });
    }

    if (action === 'generate_one') {
      const content = await generateContent(
        (type || 'carousel') as ContentType,
        (pillar || 'checklist') as Pillar,
        topic,
      );
      const image_svgs = slidesToSvgs(content.slides);
      return NextResponse.json({ content: { ...content, image_svgs } });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur génération';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
