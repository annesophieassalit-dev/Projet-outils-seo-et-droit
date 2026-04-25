import type { Slide } from '@/types/content';

const W = 1080;
const H = 1920;

// 5 thèmes vibrants — hook sombre + info version claire du même thème
const THEMES = [
  // 0 — NOIR + JAUNE ÉLECTRIQUE
  { h1: '#0A0A0A', h2: '#1C1A00', ht: '#FFFFFF', ha: '#FFE234', hm: '#1A1600',
    ib: '#FFFFF0', it: '#0A0A0A', ia: '#D4AA00', is: '#FFE234' },
  // 1 — VERT FONCÉ + LIME
  { h1: '#051505', h2: '#0A2E0A', ht: '#F0FFF0', ha: '#6EDB6E', hm: '#082808',
    ib: '#F0FFF4', it: '#051505', ia: '#1A7A1A', is: '#4ADE80' },
  // 2 — BRUN PROFOND + CORAIL
  { h1: '#180800', h2: '#3A1200', ht: '#FFF5F0', ha: '#FF7043', hm: '#2A0C00',
    ib: '#FFF8F5', it: '#180800', ia: '#C04010', is: '#FF7043' },
  // 3 — MARINE + CYAN
  { h1: '#020B18', h2: '#061E3A', ht: '#F0FAFF', ha: '#38D4F8', hm: '#041228',
    ib: '#F0FAFF', it: '#020B18', ia: '#0369A1', is: '#38D4F8' },
  // 4 — ANTHRACITE + OR
  { h1: '#0E0E0E', h2: '#1E1A08', ht: '#FFFEF5', ha: '#FBBF24', hm: '#181400',
    ib: '#FFFEF5', it: '#0E0E0E', ia: '#B45309', is: '#FBBF24' },
];

const FONT = 'Inter,Helvetica Neue,Arial,sans-serif';

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

function renderText(lines: string[], startY: number, lh: number, fs: number,
  defaultFill: string, hlFill: string, highlight: string[], anchor: string, x: number): string {
  return lines.map((line, i) => {
    const y = startY + i * lh;
    const matched = (highlight || []).find(h => line.toLowerCase().includes(h.toLowerCase()));
    if (matched) {
      const lo = line.toLowerCase().indexOf(matched.toLowerCase());
      const before = esc(line.slice(0, lo));
      const match  = esc(line.slice(lo, lo + matched.length));
      const after  = esc(line.slice(lo + matched.length));
      return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${fs}" font-family="${FONT}" font-weight="800">`
        + `<tspan fill="${defaultFill}">${before}</tspan><tspan fill="${hlFill}">${match}</tspan><tspan fill="${defaultFill}">${after}</tspan></text>`;
    }
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${fs}" fill="${defaultFill}" font-family="${FONT}" font-weight="800">${esc(line)}</text>`;
  }).join('\n  ');
}

export function slideToSvg(slide: Slide, idx: number, total: number, themeIdx = 0): string {
  const t = THEMES[themeIdx % THEMES.length];
  const isHook = slide.type === 'hook' || slide.type === 'conclusion';

  if (isHook) {
    const fs = slide.text.length > 60 ? 82 : slide.text.length > 35 ? 96 : 112;
    const lh = fs * 1.3;
    const lines = wrapLines(slide.text, Math.floor(14 * (112 / fs)));
    const blockH = lines.length * lh;
    const startY = (H - blockH) / 2 + fs;
    const text = renderText(lines, startY, lh, fs, t.ht, t.ha, slide.highlight || [], 'middle', W / 2);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="rg" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="${t.hm}"/>
      <stop offset="100%" stop-color="${t.h1}"/>
    </radialGradient>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.h2}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${t.h1}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#rg)"/>
  <rect width="${W}" height="${H}" fill="url(#lg)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${t.ha}"/>
  <rect x="0" y="${H - 8}" width="${W}" height="8" fill="${t.ha}" opacity="0.5"/>
  <text x="80" y="72" font-size="22" fill="${t.ha}" font-family="${FONT}" font-weight="700" letter-spacing="6">PRÉVOIR UTILE</text>
  <rect x="80" y="90" width="120" height="3" fill="${t.ha}" opacity="0.6"/>
  ${text}
  <text x="${W / 2}" y="${H - 60}" text-anchor="middle" font-size="24" fill="${t.ht}" font-family="${FONT}" font-weight="400" opacity="0.4">${idx + 1} / ${total}</text>
</svg>`;
  }

  // Info slide — fond clair, cercle numéro coloré, texte grand et lisible
  const fs = slide.text.length > 80 ? 58 : slide.text.length > 50 ? 68 : 80;
  const lh = fs * 1.4;
  const lines = wrapLines(slide.text, Math.floor(16 * (80 / fs)));
  const blockH = lines.length * lh;
  const startY = (H - blockH) / 2 + fs;
  const text = renderText(lines, startY, lh, fs, t.it, t.ia, slide.highlight || [], 'middle', W / 2);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${t.ib}"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${t.is}"/>
  <rect x="0" y="${H - 8}" width="${W}" height="8" fill="${t.is}" opacity="0.35"/>
  <circle cx="110" cy="110" r="70" fill="${t.is}" opacity="0.12"/>
  <text x="110" y="130" text-anchor="middle" font-size="68" fill="${t.ia}" font-family="${FONT}" font-weight="900" opacity="0.9">${idx + 1}</text>
  <text x="${W - 80}" y="72" text-anchor="end" font-size="22" fill="${t.ia}" font-family="${FONT}" font-weight="700" letter-spacing="4" opacity="0.7">PRÉVOIR UTILE</text>
  ${text}
  <text x="${W / 2}" y="${H - 60}" text-anchor="middle" font-size="24" fill="${t.it}" font-family="${FONT}" font-weight="400" opacity="0.3">${idx + 1} / ${total}</text>
</svg>`;
}

export function slidesToSvgs(slides: Slide[], themeIdx = 0): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length, themeIdx));
}
