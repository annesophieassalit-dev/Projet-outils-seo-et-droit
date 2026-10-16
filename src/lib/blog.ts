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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
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

  // Add IDs to H2 headings and collect for TOC
  const headings: { id: string; text: string }[] = [];
  const withIds = result.toString().replace(/<h2>(.*?)<\/h2>/g, (_, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = slugify(text);
    headings.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });

  // Tag only CTA links (inscription or kit) with null-byte delimiters
  const tagged = withIds.replace(
    /<p><a href="([^"]+)">([^<]+)<\/a><\/p>/g,
    (match, href, text) => {
      if (href.includes("/inscription") || href.includes("systeme.io")) {
        return `\x00${href}\x01${text.trim()}\x00`;
      }
      return match;
    }
  );

  // Merge consecutive tagged CTAs into one visual block
  let html = tagged.replace(
    /(\x00[^\x00]+\x00\s*)+/g,
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
          const style = isKit
            ? "display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#fde0e2;color:#b33c46 !important;text-decoration:none !important;padding:0.875rem 1.5rem;border:2px solid #fbc4c8;border-radius:0.75rem;font-weight:600;font-size:0.9375rem;font-family:inherit;line-height:1.4;"
            : "display:block;width:100%;box-sizing:border-box;text-align:center;background-color:#e86870;color:#ffffff !important;text-decoration:none !important;padding:0.875rem 1.5rem;border-radius:0.75rem;font-weight:700;font-size:0.9375rem;font-family:inherit;line-height:1.4;";
          return `<a href="${href}" style="${style}">${text}</a>`;
        })
        .join("");

      const wrapStyle = "margin:2.5rem 0;padding:1.75rem;background-color:#fff5f5;border:1px solid #fdd;border-radius:1rem;text-align:center;";
      const leadStyle = "color:#4b5563;font-size:0.875rem;line-height:1.6;margin:0 0 1.25rem 0;";
      const btnWrapStyle = "display:flex;flex-direction:column;gap:0.75rem;max-width:22rem;margin:0 auto;";
      return `<div style="${wrapStyle}"><p style="${leadStyle}">${lead}</p><div style="${btnWrapStyle}">${buttons}</div></div>`;
    }
  );

  // Insert TOC before the first H2 if 3+ sections
  if (headings.length >= 3) {
    const tocItems = headings
      .map(({ id, text }) =>
        `<li><a href="#${id}" style="color:#2f5e4e;text-decoration:none;">${text}</a></li>`
      )
      .join("");
    const toc = `<nav class="toc-block not-prose" aria-label="Sommaire"><p class="toc-title">Sommaire</p><ol class="toc-list">${tocItems}</ol></nav>`;
    const firstH2 = html.indexOf("<h2");
    if (firstH2 > 0) {
      html = html.slice(0, firstH2) + toc + html.slice(firstH2);
    }
  }

  return html;
}
