import type { Slide } from '@/types/content';

const W = 1080;
const H = 1920;
const PAD = 90;

// Palette Prévoir Utile logo: vert forêt, crème, sauge, olive
const THEMES = [
  // DARK — hook/conclusion : fond vert forêt
  { bg: '#2A3D18', text: '#F2EDD8', hl: '#A8BC5A', accent: '#A8BC5A' },
  // KRAFT — fond crème, lignes carnet
  { bg: '#F2EDD8', text: '#2A3D18', hl: '#6B7C2A', accent: '#6B7C2A' },
  // SAGE — fond vert sauge, style fiche
  { bg: '#C8D4A2', text: '#2A3D18', hl: '#2A3D18', accent: '#4A5E1A' },
];

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrapLines(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (test.length > maxChars) { if (cur) lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function themeIndex(slide: Slide, idx: number): number {
  if (slide.type === 'hook' || slide.type === 'conclusion') return 0;
  return idx % 2 === 1 ? 1 : 2;
}

function bgExtras(tIdx: number, accent: string): string {
  if (tIdx === 1) {
    // Kraft/carnet : lignes horizontales légères
    return Array.from({ length: 17 }, (_, i) =>
      `<line x1="${PAD}" y1="${290 + i * 92}" x2="${W - PAD}" y2="${290 + i * 92}" stroke="${accent}" stroke-width="1.5" opacity="0.22"/>`
    ).join('\n  ');
  }
  if (tIdx === 2) {
    // Sage/fiche : ovales feuilles en coin
    return `<ellipse cx="980" cy="1820" rx="70" ry="28" fill="${accent}" opacity="0.18" transform="rotate(-40 980 1820)"/>
  <ellipse cx="910" cy="1865" rx="52" ry="20" fill="${accent}" opacity="0.12" transform="rotate(-55 910 1865)"/>
  <ellipse cx="105" cy="95" rx="52" ry="20" fill="${accent}" opacity="0.12" transform="rotate(40 105 95)"/>`;
  }
  return '';
}

export function slideToSvg(slide: Slide, idx: number, total: number): string {
  const tIdx = themeIndex(slide, idx);
  const t = THEMES[tIdx];

  const fs = slide.text.length > 80 ? 56 : slide.text.length > 50 ? 66 : 78;
  const lh = fs * 1.55;
  const maxChars = Math.floor(18 * (78 / fs));
  const lines = wrapLines(slide.text, maxChars);
  const blockH = lines.length * lh;
  const startY = (H - blockH) / 2 + fs;

  const textEls = lines.map((line, i) => {
    const y = startY + i * lh;
    const hl = slide.highlight || [];
    const matched = hl.find(h => line.toLowerCase().includes(h.toLowerCase()));
    if (matched) {
      const lo = line.toLowerCase().indexOf(matched.toLowerCase());
      const before = esc(line.slice(0, lo));
      const match = esc(line.slice(lo, lo + matched.length));
      const after = esc(line.slice(lo + matched.length));
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" font-family="Georgia,serif" font-weight="700"><tspan fill="${t.text}">${before}</tspan><tspan fill="${t.hl}">${match}</tspan><tspan fill="${t.text}">${after}</tspan></text>`;
    }
    return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" fill="${t.text}" font-family="Georgia,serif" font-weight="700">${esc(line)}</text>`;
  }).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  ${bgExtras(tIdx, t.accent)}
  <rect x="${PAD}" y="94" width="${W - PAD * 2}" height="2" fill="${t.accent}" opacity="0.5"/>
  <rect x="${PAD}" y="${H - 114}" width="${W - PAD * 2}" height="2" fill="${t.accent}" opacity="0.5"/>
  <text x="${W / 2}" y="62" text-anchor="middle" font-size="24" fill="${t.accent}" font-family="Georgia,serif" letter-spacing="4" font-weight="700">PRÉVOIR UTILE</text>
  ${textEls}
  <text x="${W / 2}" y="${H - 68}" text-anchor="middle" font-size="26" fill="${t.text}" font-family="Georgia,serif" opacity="0.35">${idx + 1} / ${total}</text>
</svg>`;
}

export function slidesToSvgs(slides: Slide[]): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length));
}
