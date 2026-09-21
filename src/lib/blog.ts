import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
  tags: string[];
  readingTime: number;
}

function calculateReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const today = new Date().toISOString().slice(0, 10);
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug: data.slug || file.replace(".md", ""),
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        content,
        tags: data.tags || [],
        readingTime: calculateReadingTime(content),
      };
    })
    .filter((p) => p.date <= today)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function renderMarkdown(content: string): Promise<string> {
  const result = await remark().use(remarkHtml, { sanitize: false }).process(content);

  // Tag standalone CTA links with null-byte delimiters for safe grouping
  const tagged = result.toString().replace(
    /<p><a href="([^"]+)">([^<]+)<\/a><\/p>/g,
    (_, href, text) => `\x00${href}\x01${text.trim()}\x00`
  );

  // Merge consecutive tagged CTAs into one visual block
  const html = tagged.replace(
    /(\x00[^\x00]+\x00\n?)+/g,
    (group) => {
      const parts = Array.from(group.matchAll(/\x00([^\x01]+)\x01([^\x00]+)\x00/g));
      const hasKit = parts.some(([, href]) => href.includes("systeme.io"));
      const hasTool = parts.some(([, href]) => href.includes("/inscription"));

      const lead = hasTool && hasKit
        ? "Visible & Conforme analyse vos textes et génère des posts ajustés. Le Guide des 51 mots pour identifier les termes à risque dans vos propres textes."
        : hasKit
          ? "51 mots qui peuvent changer la qualification juridique de votre communication. Identifiez-les dans vos propres textes."
          : "Visible & Conforme analyse vos textes, repère les formulations à risque et génère des posts ajustés pour vos réseaux.";

      const buttons = parts
        .map(([, href, text]) => {
          const isKit = href.includes("systeme.io");
          const cls = isKit ? "cta-btn cta-btn-secondary" : "cta-btn";
          const style = isKit
            ? "background-color:#fde0e2;color:#b33c46;text-decoration:none;padding:1.25rem 2rem;border:2px solid #fbc4c8;"
            : "background-color:#e86870;color:#ffffff;text-decoration:none;padding:1.25rem 2rem;";
          return `<a href="${href}" class="${cls}" style="${style}">${text}</a>`;
        })
        .join("");

      return `<div class="cta-block not-prose"><p class="cta-lead">${lead}</p><div class="cta-buttons">${buttons}</div></div>`;
    }
  );

  // Reposition CTA block to the middle of the article (before the middle H2)
  const ctaMarker = '<div class="cta-block not-prose">';
  const ctaIdx = html.indexOf(ctaMarker);
  if (ctaIdx !== -1) {
    const ctaEndStr = '</div></div>';
    const ctaEndIdx = html.indexOf(ctaEndStr, ctaIdx) + ctaEndStr.length;
    const ctaBlock = html.slice(ctaIdx, ctaEndIdx);
    const body = html.slice(0, ctaIdx) + html.slice(ctaEndIdx);

    const h2Pos: number[] = [];
    let p = 0;
    while ((p = body.indexOf('<h2', p)) !== -1) { h2Pos.push(p); p++; }

    const insertAt = h2Pos.length >= 2
      ? h2Pos[Math.ceil(h2Pos.length / 2)]
      : Math.floor(body.length / 2);
    return body.slice(0, insertAt) + ctaBlock + body.slice(insertAt);
  }

  return html;
}
