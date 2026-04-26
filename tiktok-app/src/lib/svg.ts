import type { Slide } from '@/types/content';

const W = 1080;
const H = 1920;
const HOOK_TW = 800;
const TW = W - 160;
const FONT = "'Montserrat','Arial Black','Helvetica Neue',Arial,sans-serif";

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

function safeFontSize(desired: number, text: string, maxW = TW): number {
  const longest = Math.max(...text.split(' ').map(w => w.length));
  return Math.min(desired, Math.max(52, Math.floor(maxW / (longest * 0.62))));
}

function hookLayout(text: string, desired: number): { lines: string[]; fs: number } {
  let fs = safeFontSize(desired, text, HOOK_TW);
  for (let i = 0; i < 4; i++) {
    const maxC = Math.max(5, Math.floor(1235 / fs));
    const lines = wrapLines(text, maxC);
    const orphan = lines.length > 1 &&
      lines.some(l => l.trim().split(' ').length === 1 && l.trim().length <= 3);
    if (!orphan) return { lines, fs };
    fs = Math.round(fs * 0.88);
  }
  const maxC = Math.max(5, Math.floor(1235 / fs));
  return { lines: wrapLines(text, maxC), fs };
}

// Design dark premium — accent en alternance, fond unique quasi-noir
const THEMES = [
  { la: 'ERREUR',      ca: '#D4A843' }, // or/saffron
  { la: 'ASTUCE',      ca: '#7A9E72' }, // vert sage clair (lisible sur noir)
  { la: 'VRAI / FAUX', ca: '#C25B42' }, // rouge brique clair
  { la: 'SAVAIS-TU ?', ca: '#D4A843' }, // or/saffron
  { la: 'CHECKLIST',   ca: '#7A9E72' }, // vert sage
];

const BG   = '#141414';
const CARD  = '#252525';
const TEXT  = '#F5F1E8';

export function slideToSvg(slide: Slide, idx: number, total: number, themeIdx = 0): string {
  const t = THEMES[themeIdx % THEMES.length];

  // ── HOOK / CONCLUSION ─────────────────────────────────────────────────────
  if (slide.type === 'hook' || slide.type === 'conclusion') {
    const text = slide.text; // mixed case — pas de toUpperCase()
    const len = text.length;
    const desired = len <= 20 ? 168 : len <= 32 ? 148 : len <= 48 ? 120 : len <= 65 ? 100 : 84;
    const { lines, fs } = hookLayout(text, desired);
    const lh = Math.round(fs * 1.24);
    const blockH = lines.length * lh;

    const firstY = Math.round(H * 0.50 - blockH / 2 + fs);
    const padV = 160;
    const padH = 80;
    const cardX = padH;
    const cardW = W - padH * 2;
    const cardY = firstY - fs - padV;
    const cardH = blockH + padV * 2;

    const textEls = lines.map((line, i) => {
      const y = firstY + i * lh;
      const m = (slide.highlight || []).find(h => line.toLowerCase().includes(h.toLowerCase()));
      if (m) {
        const lo = line.toLowerCase().indexOf(m.toLowerCase());
        return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" font-family="${FONT}" font-weight="800"><tspan fill="${TEXT}">${esc(line.slice(0, lo))}</tspan><tspan fill="${t.ca}">${esc(line.slice(lo, lo + m.length))}</tspan><tspan fill="${TEXT}">${esc(line.slice(lo + m.length))}</tspan></text>`;
      }
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" fill="${TEXT}" font-family="${FONT}" font-weight="800">${esc(line)}</text>`;
    }).join('\n  ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="cs" x="-8%" y="-5%" width="116%" height="112%">
      <feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0" y="0" width="${W}" height="5" fill="${t.ca}" opacity="0.75"/>
  <text x="${W / 2}" y="${cardY - 60}" text-anchor="middle" font-size="48" fill="${t.ca}" font-family="${FONT}" font-weight="700" letter-spacing="7" opacity="0.92">${esc(t.la)}</text>
  <rect x="${W / 2 - 70}" y="${cardY - 24}" width="140" height="3" fill="${t.ca}" rx="1" opacity="0.45"/>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="${CARD}" rx="24" filter="url(#cs)"/>
  ${textEls}
  <text x="${W / 2}" y="${H - 50}" text-anchor="middle" font-size="19" fill="${TEXT}" font-family="${FONT}" font-weight="600" letter-spacing="6" opacity="0.22">PRÉVOIR UTILE</text>
</svg>`;
  }

  // ── INFO / COMPLEMENT ─────────────────────────────────────────────────────
  const len2 = slide.text.length;
  const desired2 = len2 <= 38 ? 84 : len2 <= 58 ? 74 : len2 <= 78 ? 64 : 57;
  const fs2 = safeFontSize(desired2, slide.text);
  const lh2 = Math.round(fs2 * 1.38);
  const maxC2 = Math.max(10, Math.floor(1235 / fs2));
  const lines2 = wrapLines(slide.text, maxC2);
  const blockH2 = lines2.length * lh2;
  const textCenter2 = 510 + (H - 80 - 510) / 2;
  const startY2 = Math.round(textCenter2 - blockH2 / 2 + fs2);

  const textEls2 = lines2.map((line, i) => {
    const y = startY2 + i * lh2;
    const m = (slide.highlight || []).find(h => line.toLowerCase().includes(h.toLowerCase()));
    if (m) {
      const lo = line.toLowerCase().indexOf(m.toLowerCase());
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs2}" font-family="${FONT}" font-weight="700"><tspan fill="${TEXT}">${esc(line.slice(0, lo))}</tspan><tspan fill="${t.ca}">${esc(line.slice(lo, lo + m.length))}</tspan><tspan fill="${TEXT}">${esc(line.slice(lo + m.length))}</tspan></text>`;
    }
    return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs2}" fill="${TEXT}" font-family="${FONT}" font-weight="700">${esc(line)}</text>`;
  }).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${t.ca}"/>
  <text x="${W / 2}" y="480" text-anchor="middle" font-size="270" fill="${t.ca}" font-family="${FONT}" font-weight="900" opacity="0.06">${idx + 1}</text>
  <text x="${W / 2}" y="456" text-anchor="middle" font-size="218" fill="${t.ca}" font-family="${FONT}" font-weight="900" opacity="0.32">${idx + 1}</text>
  <rect x="${W / 2 - 96}" y="498" width="192" height="4" fill="${t.ca}" rx="2"/>
  ${textEls2}
  <text x="${W / 2}" y="${H - 50}" text-anchor="middle" font-size="19" fill="${TEXT}" font-family="${FONT}" opacity="0.18">${idx + 1} / ${total}</text>
</svg>`;
}

export function slidesToSvgs(slides: Slide[], themeIdx = 0): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length, themeIdx));
}
