import type { Slide } from '@/types/content';

const W = 1080;
const H = 1920;
const TW = W - 160;
// Arial Black donne le punch TikTok natif, Inter en fallback
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

// Réduit fs si le mot le plus long déborderait (0.65 = coefficient conservateur pour uppercase bold)
function safeFontSize(desired: number, text: string): number {
  const longest = Math.max(...text.split(' ').map(w => w.length));
  return Math.min(desired, Math.max(56, Math.floor(TW / (longest * 0.65))));
}

// Choisit fs et lignes — réduit fs pour éviter orphelins (mot court seul)
function hookLayout(text: string, desired: number): { lines: string[]; fs: number } {
  let fs = safeFontSize(desired, text);
  for (let i = 0; i < 4; i++) {
    // 1420 = TW / 0.65 ≈ largeur conservatrice par char incluant espaces
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

const THEMES = [
  // 0: Noir+Jaune — label ERREUR
  { craft: false, bg: '#0A0A0A', bgM: '#1C1400', bar: '#FFE234', la: 'ERREUR',
    ht: '#FFFFFF', ha: '#FFE234', ib: '#FFFFF8', it: '#0A0A0A', ia: '#B8860B', nb: '#FFE234' },
  // 1: Vert foncé — label ASTUCE
  { craft: false, bg: '#041A04', bgM: '#0A2E0A', bar: '#4ADE80', la: 'ASTUCE',
    ht: '#F0FFF0', ha: '#4ADE80', ib: '#F0FFF4', it: '#041A04', ia: '#1A7A1A', nb: '#4ADE80' },
  // 2: Papier Kraft — VRAI / FAUX
  { craft: true,  bg: '#B8872E', bgM: '#F2E0A0', bar: '#8B6310', la: 'VRAI / FAUX',
    ht: '#1A0A00', ha: '#8B2000', ib: '#F2E0A0', it: '#1A0A00', ia: '#7A2800', nb: '#8B6310' },
  // 3: Bleu nuit — label SAVAIS-TU ?
  { craft: false, bg: '#020B18', bgM: '#041E40', bar: '#38D4F8', la: 'SAVAIS-TU ?',
    ht: '#F0FAFF', ha: '#38D4F8', ib: '#EFF9FF', it: '#020B18', ia: '#0369A1', nb: '#38D4F8' },
  // 4: Anthracite+Ambre — label CHECKLIST
  { craft: false, bg: '#0E0E0E', bgM: '#1E1600', bar: '#FBBF24', la: 'CHECKLIST',
    ht: '#FFFEF5', ha: '#FBBF24', ib: '#FFFEF5', it: '#0E0E0E', ia: '#B45309', nb: '#FBBF24' },
];

export function slideToSvg(slide: Slide, idx: number, total: number, themeIdx = 0): string {
  const t = THEMES[themeIdx % THEMES.length];

  // ── HOOK / CONCLUSION ──────────────────────────────────────────────────────
  if (slide.type === 'hook' || slide.type === 'conclusion') {
    const up = slide.text.toUpperCase();
    const len = up.length;
    const desired = len <= 16 ? 172 : len <= 24 ? 150 : len <= 36 ? 122 : len <= 52 ? 98 : 82;
    const { lines, fs } = hookLayout(up, desired);
    const lh = Math.round(fs * 1.16);
    const blockH = lines.length * lh;
    // Légèrement au-dessus du centre pour équilibrer avec le micro-label en haut
    const firstY = Math.round(H * 0.48 - blockH / 2 + fs);

    const textEl = (line: string, y: number, fill: string, accent: string) => {
      const m = (slide.highlight || []).find(h => line.toLowerCase().includes(h.toLowerCase()));
      if (m) {
        const lo = line.toLowerCase().indexOf(m.toLowerCase());
        return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" font-family="${HOOK_FONT}" font-weight="900"><tspan fill="${fill}">${esc(line.slice(0, lo))}</tspan><tspan fill="${accent}">${esc(line.slice(lo, lo + m.length))}</tspan><tspan fill="${fill}">${esc(line.slice(lo + m.length))}</tspan></text>`;
      }
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" fill="${fill}" font-family="${HOOK_FONT}" font-weight="900">${esc(line)}</text>`;
    };

    // ── KRAFT PAPER (thème 2) ──────────────────────────────────────────────
    if (t.craft) {
      // Carte frosted positionnée autour du texte — taille calculée au pixel
      const cardPad = 88;
      const cardX = 56;
      const cardW = W - 112;
      const cardY = firstY - fs - cardPad;
      const cardH = blockH + cardPad * 2;
      // Label VRAI/FAUX juste au-dessus de la carte, ancré visuellement
      const labelY = cardY - 20;
      const textEls = lines.map((l, i) => textEl(l, firstY + i * lh, t.ht, t.ha)).join('\n  ');

      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="kg" cx="50%" cy="46%" r="70%">
      <stop offset="0%" stop-color="${t.bgM}"/>
      <stop offset="100%" stop-color="${t.bg}"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#kg)"/>
  <rect x="0" y="0" width="${W}" height="14" fill="${t.bar}"/>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="${t.bar}" opacity="0.38"/>
  <text x="${W / 2 - 14}" y="${labelY}" text-anchor="end" font-size="48" fill="#2A7D2A" font-family="${FONT}" font-weight="800" letter-spacing="1">VRAI</text>
  <text x="${W / 2}" y="${labelY - 4}" text-anchor="middle" font-size="36" fill="#5D4037" font-family="${FONT}" font-weight="200" opacity="0.55"> /</text>
  <text x="${W / 2 + 14}" y="${labelY}" text-anchor="start" font-size="48" fill="#C62828" font-family="${FONT}" font-weight="800" letter-spacing="1">FAUX</text>
  <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="white" fill-opacity="0.80" rx="22"/>
  ${textEls}
  <text x="${W / 2}" y="${H - 62}" text-anchor="middle" font-size="26" fill="${t.ht}" font-family="${FONT}" font-weight="700" letter-spacing="6" opacity="0.42">PRÉVOIR UTILE</text>
</svg>`;
    }

    // ── FOND SOMBRE (thèmes 0,1,3,4) — micro-label discret en haut ────────
    const textEls = lines.map((l, i) => textEl(l, firstY + i * lh, t.ht, t.ha)).join('\n  ');
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
  <text x="${W / 2}" y="92" text-anchor="middle" font-size="32" fill="${t.bar}" font-family="${FONT}" font-weight="700" letter-spacing="10" opacity="0.82">${esc(t.la)}</text>
  <rect x="${W / 2 - 72}" y="112" width="144" height="3" fill="${t.bar}" rx="1" opacity="0.45"/>
  ${textEls}
  <text x="${W / 2}" y="${H - 62}" text-anchor="middle" font-size="26" fill="${t.ht}" font-family="${FONT}" font-weight="700" letter-spacing="6" opacity="0.28">PRÉVOIR UTILE</text>
</svg>`;
  }

  // ── INFO / COMPLEMENT ─────────────────────────────────────────────────────
  const len2 = slide.text.length;
  const desired2 = len2 <= 38 ? 90 : len2 <= 58 ? 78 : len2 <= 78 ? 68 : 60;
  const fs2 = safeFontSize(desired2, slide.text.toUpperCase());
  const lh2 = Math.round(fs2 * 1.38);
  const maxC2 = Math.max(10, Math.floor(1420 / fs2));
  const lines2 = wrapLines(slide.text, maxC2);
  const blockH2 = lines2.length * lh2;
  // Centré entre bas du numéro (≈370) et compteur (H-80)
  const textCenter2 = 370 + (H - 80 - 370) / 2;
  const startY2 = Math.round(textCenter2 - blockH2 / 2 + fs2);

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
  <text x="${W / 2}" y="340" text-anchor="middle" font-size="270" fill="${t.nb}" font-family="${FONT}" font-weight="900" opacity="0.09">${idx + 1}</text>
  <text x="${W / 2}" y="316" text-anchor="middle" font-size="218" fill="${t.ia}" font-family="${FONT}" font-weight="900" opacity="0.50">${idx + 1}</text>
  <rect x="${W / 2 - 100}" y="358" width="200" height="5" fill="${t.nb}" rx="2"/>
  ${textEls2}
  <text x="${W / 2}" y="${H - 58}" text-anchor="middle" font-size="22" fill="${t.it}" font-family="${FONT}" opacity="0.20">${idx + 1} / ${total}</text>
</svg>`;
}

export function slidesToSvgs(slides: Slide[], themeIdx = 0): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length, themeIdx));
}
