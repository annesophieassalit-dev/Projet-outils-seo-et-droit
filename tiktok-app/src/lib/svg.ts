import type { Slide } from '@/types/content';

const W = 1080;
const H = 1920;
const TW = W - 160;
const HOOK_FONT = "'Arial Black','Helvetica Neue',Arial,sans-serif";
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

function safeFontSize(desired: number, text: string): number {
  const longest = Math.max(...text.split(' ').map(w => w.length));
  return Math.min(desired, Math.max(56, Math.floor(TW / (longest * 0.65))));
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

// 5 formats — accent couleur sur carte blanche
const THEMES = [
  { la: 'ERREUR',      ca: '#C41A1A', ia: '#A01010', nb: '#C41A1A' },
  { la: 'ASTUCE',      ca: '#1A6B20', ia: '#155518', nb: '#2E8B38' },
  { la: 'VRAI / FAUX', ca: '#7A4200', ia: '#623400', nb: '#8B5810' },
  { la: 'SAVAIS-TU ?', ca: '#0050A0', ia: '#003D80', nb: '#1570C8' },
  { la: 'CHECKLIST',   ca: '#8B3000', ia: '#702800', nb: '#A84010' },
];

// Kraft clair (smooth) = thèmeIdx pair | Kraft foncé (froissé) = thèmeIdx impair
function kraft(themeIdx: number) {
  const light = themeIdx % 2 === 0;
  return light
    ? { bg: '#EEDED8', freq: '0.85 0.70', seed: '3', oct: '4', sc: '#7A5030', so: '0.17', lc: '#7A5030' }
    : { bg: '#B87840', freq: '0.40 0.35', seed: '8', oct: '3', sc: '#3A1808', so: '0.30', lc: '#F0D090' };
}

// Info slides : crème chaud universel
const IB = '#FFFBF4';
const IT = '#1A1200';

export function slideToSvg(slide: Slide, idx: number, total: number, themeIdx = 0): string {
  const t = THEMES[themeIdx % THEMES.length];

  // ── HOOK / CONCLUSION : fond kraft + carte blanche en relief ──────────────
  if (slide.type === 'hook' || slide.type === 'conclusion') {
    const up = slide.text.toUpperCase();
    const len = up.length;
    const desired = len <= 16 ? 172 : len <= 24 ? 150 : len <= 36 ? 122 : len <= 52 ? 98 : 82;
    const { lines, fs } = hookLayout(up, desired);
    const lh = Math.round(fs * 1.16);
    const blockH = lines.length * lh;

    // Texte centré à 50% de la hauteur
    const firstY = Math.round(H * 0.50 - blockH / 2 + fs);
    // Carte blanche très haute — padding généreux
    const padV = 150;
    const padH = 72;
    const cardX = padH;
    const cardW = W - padH * 2;
    const cardY = firstY - fs - padV;
    const cardH = blockH + padV * 2;

    const k = kraft(themeIdx);

    const textEls = lines.map((line, i) => {
      const y = firstY + i * lh;
      const m = (slide.highlight || []).find(h => line.toLowerCase().includes(h.toLowerCase()));
      if (m) {
        const lo = line.toLowerCase().indexOf(m.toLowerCase());
        return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" font-family="${HOOK_FONT}" font-weight="900"><tspan fill="#111111">${esc(line.slice(0, lo))}</tspan><tspan fill="${t.ca}">${esc(line.slice(lo, lo + m.length))}</tspan><tspan fill="#111111">${esc(line.slice(lo + m.length))}</tspan></text>`;
      }
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" fill="#111111" font-family="${HOOK_FONT}" font-weight="900">${esc(line)}</text>`;
    }).join('\n  ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="gr" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${k.freq}" numOctaves="${k.oct}" seed="${k.seed}" result="noise"/>
      <feBlend in="SourceGraphic" in2="noise" mode="soft-light"/>
    </filter>
    <filter id="cs" x="-6%" y="-4%" width="112%" height="110%">
      <feDropShadow dx="0" dy="16" stdDeviation="30" flood-color="${k.sc}" flood-opacity="${k.so}"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${k.bg}" filter="url(#gr)"/>
  <rect x="0" y="0" width="${W}" height="12" fill="${t.ca}" opacity="0.55"/>
  <rect x="0" y="${H - 12}" width="${W}" height="12" fill="${t.ca}" opacity="0.28"/>
  <text x="${W / 2}" y="88" text-anchor="middle" font-size="28" fill="${k.lc}" font-family="${FONT}" font-weight="700" letter-spacing="10" opacity="0.80">${esc(t.la)}</text>
  <rect x="${W / 2 - 56}" y="106" width="112" height="2" fill="${k.lc}" rx="1" opacity="0.42"/>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="white" rx="28" filter="url(#cs)"/>
  ${textEls}
  <text x="${W / 2}" y="${H - 60}" text-anchor="middle" font-size="22" fill="${k.lc}" font-family="${FONT}" font-weight="600" letter-spacing="5" opacity="0.48">PRÉVOIR UTILE</text>
</svg>`;
  }

  // ── INFO / COMPLEMENT : fond crème chaud, grand numéro décoratif ──────────
  const len2 = slide.text.length;
  const desired2 = len2 <= 38 ? 90 : len2 <= 58 ? 78 : len2 <= 78 ? 68 : 60;
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
  <rect x="0" y="0" width="${W}" height="10" fill="${t.nb}"/>
  <text x="${W / 2}" y="340" text-anchor="middle" font-size="270" fill="${t.nb}" font-family="${FONT}" font-weight="900" opacity="0.07">${idx + 1}</text>
  <text x="${W / 2}" y="316" text-anchor="middle" font-size="218" fill="${t.ia}" font-family="${FONT}" font-weight="900" opacity="0.46">${idx + 1}</text>
  <rect x="${W / 2 - 100}" y="358" width="200" height="5" fill="${t.nb}" rx="2"/>
  ${textEls2}
  <text x="${W / 2}" y="${H - 58}" text-anchor="middle" font-size="22" fill="${IT}" font-family="${FONT}" opacity="0.18">${idx + 1} / ${total}</text>
</svg>`;
}

export function slidesToSvgs(slides: Slide[], themeIdx = 0): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length, themeIdx));
}
