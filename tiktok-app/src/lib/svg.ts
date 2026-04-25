import type { Slide } from '@/types/content';

const W = 1080;
const H = 1920;
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

// 5 formats — badge coloré + texte GÉANT sur fond sombre / numéro géant sur fond clair
const THEMES = [
  // 0: Noir+Jaune — badge ERREUR rouge
  { bg: '#0A0A0A', bgM: '#1C1400', bar: '#FFE234', lbg: '#CC2222', la: 'ERREUR',    ht: '#FFFFFF', ha: '#FFE234', ib: '#FFFFF8', it: '#0A0A0A', ia: '#B8860B', nb: '#FFE234' },
  // 1: Vert foncé — badge ASTUCE vert
  { bg: '#041A04', bgM: '#0A2E0A', bar: '#4ADE80', lbg: '#166534', la: 'ASTUCE',    ht: '#F0FFF0', ha: '#4ADE80', ib: '#F0FFF4', it: '#041A04', ia: '#1A7A1A', nb: '#4ADE80' },
  // 2: Craft/Orange — badge VRAI / FAUX orange brûlé
  { bg: '#1A0E00', bgM: '#2E1A00', bar: '#FF7043', lbg: '#B83A10', la: 'VRAI / FAUX', ht: '#FFFEF5', ha: '#FF7043', ib: '#FFF8F0', it: '#1A0E00', ia: '#C04010', nb: '#FF7043' },
  // 3: Bleu nuit — badge SAVAIS-TU ? bleu
  { bg: '#020B18', bgM: '#041E40', bar: '#38D4F8', lbg: '#0369A1', la: 'SAVAIS-TU ?', ht: '#F0FAFF', ha: '#38D4F8', ib: '#EFF9FF', it: '#020B18', ia: '#0369A1', nb: '#38D4F8' },
  // 4: Anthracite+Ambre — badge CHECKLIST
  { bg: '#0E0E0E', bgM: '#1E1600', bar: '#FBBF24', lbg: '#92400E', la: 'CHECKLIST', ht: '#FFFEF5', ha: '#FBBF24', ib: '#FFFEF5', it: '#0E0E0E', ia: '#B45309', nb: '#FBBF24' },
];

export function slideToSvg(slide: Slide, idx: number, total: number, themeIdx = 0): string {
  const t = THEMES[themeIdx % THEMES.length];

  // ── HOOK / CONCLUSION : fond sombre, badge + texte MAJUSCULES GÉANT ──
  if (slide.type === 'hook' || slide.type === 'conclusion') {
    const up = slide.text.toUpperCase();
    const len = up.length;
    // Police très grande pour les hooks courts — lisible en 0,5s
    const fs = len <= 16 ? 172 : len <= 24 ? 150 : len <= 36 ? 122 : len <= 52 ? 98 : 82;
    const lh = Math.round(fs * 1.14);
    const maxC = Math.max(7, Math.floor(13 * (172 / fs)));
    const lines = wrapLines(up, maxC);

    const textEls = lines.map((line, i) => {
      const y = 468 + i * lh;
      const m = (slide.highlight || []).find(h => line.toLowerCase().includes(h.toLowerCase()));
      if (m) {
        const lo = line.toLowerCase().indexOf(m.toLowerCase());
        return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" font-family="${FONT}" font-weight="900"><tspan fill="${t.ht}">${esc(line.slice(0, lo))}</tspan><tspan fill="${t.ha}">${esc(line.slice(lo, lo + m.length))}</tspan><tspan fill="${t.ht}">${esc(line.slice(lo + m.length))}</tspan></text>`;
      }
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" fill="${t.ht}" font-family="${FONT}" font-weight="900">${esc(line)}</text>`;
    }).join('\n  ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="rg" cx="50%" cy="38%" r="85%">
      <stop offset="0%" stop-color="${t.bgM}"/>
      <stop offset="100%" stop-color="${t.bg}"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#rg)"/>
  <rect x="0" y="0" width="${W}" height="14" fill="${t.bar}"/>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="${t.bar}" opacity="0.35"/>
  <rect x="130" y="208" width="${W - 260}" height="122" fill="${t.lbg}" rx="18"/>
  <text x="${W / 2}" y="293" text-anchor="middle" font-size="66" fill="#FFFFFF" font-family="${FONT}" font-weight="900" letter-spacing="4">${esc(t.la)}</text>
  ${textEls}
  <text x="${W / 2}" y="${H - 62}" text-anchor="middle" font-size="26" fill="${t.ht}" font-family="${FONT}" font-weight="700" letter-spacing="6" opacity="0.28">PRÉVOIR UTILE</text>
</svg>`;
  }

  // ── INFO / COMPLEMENT : fond clair, grand numéro décoratif, texte large ──
  const len2 = slide.text.length;
  const fs2 = len2 <= 38 ? 90 : len2 <= 58 ? 78 : len2 <= 78 ? 68 : 60;
  const lh2 = Math.round(fs2 * 1.38);
  const maxC2 = Math.max(10, Math.floor(16 * (90 / fs2)));
  const lines2 = wrapLines(slide.text, maxC2);
  const blockH2 = lines2.length * lh2;
  const startY2 = Math.max(520, Math.round((H - blockH2) / 2 + fs2));

  const textEls2 = lines2.map((line, i) => {
    const y = startY2 + i * lh2;
    const m = (slide.highlight || []).find(h => line.toLowerCase().includes(h.toLowerCase()));
    if (m) {
      const lo = line.toLowerCase().indexOf(m.toLowerCase());
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs2}" font-family="${FONT}" font-weight="800"><tspan fill="${t.it}">${esc(line.slice(0, lo))}</tspan><tspan fill="${t.ia}">${esc(line.slice(lo, lo + m.length))}</tspan><tspan fill="${t.it}">${esc(line.slice(lo + m.length))}</tspan></text>`;
    }
    return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs2}" fill="${t.it}" font-family="${FONT}" font-weight="800">${esc(line)}</text>`;
  }).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${t.ib}"/>
  <rect x="0" y="0" width="${W}" height="10" fill="${t.nb}"/>
  <text x="${W / 2}" y="340" text-anchor="middle" font-size="270" fill="${t.nb}" font-family="${FONT}" font-weight="900" opacity="0.10">${idx + 1}</text>
  <text x="${W / 2}" y="316" text-anchor="middle" font-size="218" fill="${t.ia}" font-family="${FONT}" font-weight="900" opacity="0.52">${idx + 1}</text>
  <rect x="${W / 2 - 100}" y="358" width="200" height="6" fill="${t.nb}" rx="3"/>
  ${textEls2}
  <text x="${W / 2}" y="${H - 58}" text-anchor="middle" font-size="22" fill="${t.it}" font-family="${FONT}" opacity="0.20">${idx + 1} / ${total}</text>
</svg>`;
}

export function slidesToSvgs(slides: Slide[], themeIdx = 0): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length, themeIdx));
}
