import type { Slide } from '@/types/content';

const W = 1080;
const H = 1920;
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

function safeFontSize(desired: number, text: string): number {
  const longest = Math.max(...text.split(' ').map(w => w.length));
  return Math.min(desired, Math.max(52, Math.floor(TW / (longest * 0.65))));
}

function hookLayout(text: string, desired: number): { lines: string[]; fs: number } {
  let fs = safeFontSize(desired, text);
  for (let i = 0; i < 4; i++) {
    const maxC = Math.max(5, Math.floor(1420 / fs));
    const lines = wrapLines(text, maxC);
    const orphan = lines.length > 1 &&
      lines.some(l => l.trim().split(' ').length === 1 && l.trim().length <= 3);
    if (!orphan) return { lines, fs };
    fs = Math.round(fs * 0.88);
  }
  const maxC = Math.max(5, Math.floor(1420 / fs));
  return { lines: wrapLines(text, maxC), fs };
}

// Palette "survie douce / premium" — sans texture, sans grain
// Hook bg : vert forêt profond (pair) / crème minéral (impair)
// Accents : rouge brique · olive · sable doré

const THEMES = [
  { la: 'ERREUR',      ca: '#A63D2F', ia: '#A63D2F' }, // pair  → vert foncé bg, rouge brique
  { la: 'ASTUCE',      ca: '#5E6B56', ia: '#5E6B56' }, // impair → crème bg, olive
  { la: 'VRAI / FAUX', ca: '#D6B98C', ia: '#9E7840' }, // pair  → vert foncé bg, sable doré
  { la: 'SAVAIS-TU ?', ca: '#5E6B56', ia: '#5E6B56' }, // impair → crème bg, olive
  { la: 'CHECKLIST',   ca: '#A63D2F', ia: '#A63D2F' }, // pair  → vert foncé bg, rouge brique
];

function bgVariant(themeIdx: number) {
  const dark = themeIdx % 2 === 0;
  return dark
    ? { bg: '#243126', card: '#F5F1E8', text: '#1C1C1A', footer: '#D6B98C', shadow: '#000000', shadowOp: '0.40' }
    : { bg: '#F5F1E8', card: '#FFFFFF',  text: '#1C1C1A', footer: '#5E6B56', shadow: '#243126', shadowOp: '0.14' };
}

const IB = '#F5F1E8';
const IT = '#243126';

export function slideToSvg(slide: Slide, idx: number, total: number, themeIdx = 0): string {
  const t = THEMES[themeIdx % THEMES.length];

  // ── HOOK / CONCLUSION ─────────────────────────────────────────────────────
  if (slide.type === 'hook' || slide.type === 'conclusion') {
    const up = slide.text.toUpperCase();
    const len = up.length;
    const desired = len <= 16 ? 158 : len <= 24 ? 138 : len <= 36 ? 112 : len <= 52 ? 90 : 76;
    const { lines, fs } = hookLayout(up, desired);
    const lh = Math.round(fs * 1.18);
    const blockH = lines.length * lh;

    const firstY = Math.round(H * 0.50 - blockH / 2 + fs);
    const padV = 160;
    const padH = 80;
    const cardX = padH;
    const cardW = W - padH * 2;
    const cardY = firstY - fs - padV;
    const cardH = blockH + padV * 2;

    const v = bgVariant(themeIdx);

    const textEls = lines.map((line, i) => {
      const y = firstY + i * lh;
      const m = (slide.highlight || []).find(h => line.toLowerCase().includes(h.toLowerCase()));
      if (m) {
        const lo = line.toLowerCase().indexOf(m.toLowerCase());
        return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" font-family="${FONT}" font-weight="900"><tspan fill="${v.text}">${esc(line.slice(0, lo))}</tspan><tspan fill="${t.ca}">${esc(line.slice(lo, lo + m.length))}</tspan><tspan fill="${v.text}">${esc(line.slice(lo + m.length))}</tspan></text>`;
      }
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" fill="${v.text}" font-family="${FONT}" font-weight="900">${esc(line)}</text>`;
    }).join('\n  ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="cs" x="-8%" y="-5%" width="116%" height="112%">
      <feDropShadow dx="0" dy="22" stdDeviation="38" flood-color="${v.shadow}" flood-opacity="${v.shadowOp}"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${v.bg}"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${t.ca}"/>
  <rect x="0" y="${H - 6}" width="${W}" height="6" fill="${t.ca}" opacity="0.35"/>
  <text x="${W / 2}" y="74" text-anchor="middle" font-size="23" fill="${t.ca}" font-family="${FONT}" font-weight="700" letter-spacing="9" opacity="0.90">${esc(t.la)}</text>
  <rect x="${W / 2 - 44}" y="90" width="88" height="2" fill="${t.ca}" rx="1" opacity="0.45"/>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="${v.card}" rx="22" filter="url(#cs)"/>
  ${textEls}
  <text x="${W / 2}" y="${H - 50}" text-anchor="middle" font-size="19" fill="${v.footer}" font-family="${FONT}" font-weight="600" letter-spacing="6" opacity="0.55">PRÉVOIR UTILE</text>
</svg>`;
  }

  // ── INFO / COMPLEMENT ─────────────────────────────────────────────────────
  const len2 = slide.text.length;
  const desired2 = len2 <= 38 ? 84 : len2 <= 58 ? 74 : len2 <= 78 ? 64 : 57;
  const fs2 = safeFontSize(desired2, slide.text.toUpperCase());
  const lh2 = Math.round(fs2 * 1.38);
  const maxC2 = Math.max(10, Math.floor(1420 / fs2));
  const lines2 = wrapLines(slide.text, maxC2);
  const blockH2 = lines2.length * lh2;
  const textCenter2 = 370 + (H - 80 - 370) / 2;
  const startY2 = Math.round(textCenter2 - blockH2 / 2 + fs2);

  const textEls2 = lines2.map((line, i) => {
    const y = startY2 + i * lh2;
    const m = (slide.highlight || []).find(h => line.toLowerCase().includes(h.toLowerCase()));
    if (m) {
      const lo = line.toLowerCase().indexOf(m.toLowerCase());
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs2}" font-family="${FONT}" font-weight="800"><tspan fill="${IT}">${esc(line.slice(0, lo))}</tspan><tspan fill="${t.ia}">${esc(line.slice(lo, lo + m.length))}</tspan><tspan fill="${IT}">${esc(line.slice(lo + m.length))}</tspan></text>`;
    }
    return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs2}" fill="${IT}" font-family="${FONT}" font-weight="800">${esc(line)}</text>`;
  }).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${IB}"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${t.ia}"/>
  <text x="${W / 2}" y="340" text-anchor="middle" font-size="270" fill="${t.ia}" font-family="${FONT}" font-weight="900" opacity="0.07">${idx + 1}</text>
  <text x="${W / 2}" y="316" text-anchor="middle" font-size="218" fill="${t.ia}" font-family="${FONT}" font-weight="900" opacity="0.40">${idx + 1}</text>
  <rect x="${W / 2 - 96}" y="358" width="192" height="4" fill="${t.ia}" rx="2"/>
  ${textEls2}
  <text x="${W / 2}" y="${H - 50}" text-anchor="middle" font-size="19" fill="${IT}" font-family="${FONT}" opacity="0.20">${idx + 1} / ${total}</text>
</svg>`;
}

export function slidesToSvgs(slides: Slide[], themeIdx = 0): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length, themeIdx));
}
