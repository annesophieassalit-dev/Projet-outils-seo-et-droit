import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

function readJSON(filename: string) {
  // Works both locally and on Vercel (full repo is deployed)
  const base = path.join(process.cwd(), "..", "instagram-automation", "content");
  return JSON.parse(readFileSync(path.join(base, filename), "utf-8"));
}

export async function GET() {
  try {
    const carousels_blanc = readJSON("carousels_blanc.json");
    const carousels_seo   = readJSON("carousels_seo.json");
    const carousels_rgpd  = readJSON("carousels_rgpd.json");
    const flash_posts     = readJSON("flash_posts.json");
    const stories         = readJSON("stories_marine.json");

    return NextResponse.json({
      carousels: [
        ...carousels_blanc.map((c: Record<string, unknown>) => ({ ...c, type: "blanc" })),
        ...carousels_seo.map((c: Record<string, unknown>)   => ({ ...c, type: "seo"   })),
        ...carousels_rgpd.map((c: Record<string, unknown>)  => ({ ...c, type: "rgpd"  })),
      ],
      flash_posts,
      stories,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
