import type { Slide } from '@/types/content';

const W = 1080;
const H = 1920;
const PAD = 80;

// 5 thèmes — 1 couleur dominante par post, info slides = version claire du même thème
const POST_THEMES = [
  // 0 — NOIR MODERNE + JAUNE
  {
    hookBg1: '#1A1A1A', hookBg2: '#2E2E2E', hookText: '#FFFFFF', hookHl: '#F6E27A', hookAccent: '#F6E27A',
    infoBg: '#F7F7F5', infoText: '#1A1A1A', infoHl: '#C8960A', infoStripe: '#F6E27A',
  },
  // 1 — VERT FORÊT
  {
    hookBg1: '#1A3012', hookBg2: '#2A4A1E', hookText: '#F0F5E8', hookHl: '#A8D060', hookAccent: '#A8D060',
    infoBg: '#F0F5E8', infoText: '#1A3012', infoHl: '#2A6020', infoStripe: '#6BA040',
  },
  // 2 — CRAFT BRUN CHAUD
  {
    hookBg1: '#3A1A08', hookBg2: '#6B3A1A', hookText: '#FFF3DC', hookHl: '#F6D860', hookAccent: '#F0C040',
    infoBg: '#FAF0DC', infoText: '#3A1A08', infoHl: '#8B4A14', infoStripe: '#C87830',
  },
  // 3 — VERT SAUGE CLAIR
  {
    hookBg1: '#253C2A', hookBg2: '#3A5C40', hookText: '#EAF5EA', hookHl: '#C0E878', hookAccent: '#C0E878',
    infoBg: '#EAF5EA', infoText: '#1A3020', infoHl: '#3A7040', infoStripe: '#70B060',
  },
  // 4 — ARDOISE + OR
  {
    hookBg1: '#1C1C28', hookBg2: '#2E2E42', hookText: '#F8F6F0', hookHl: '#D4B84A', hookAccent: '#D4B84A',
    infoBg: '#F8F6F0', infoText: '#1C1C28', infoHl: '#8B7020', infoStripe: '#D4B84A',
  },
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

export function slideToSvg(slide: Slide, idx: number, total: number, postThemeIdx = 0): string {
  const pt = POST_THEMES[postThemeIdx % POST_THEMES.length];
  const isHook = slide.type === 'hook';
  const isConclusion = slide.type === 'conclusion';
  const useDark = isHook || isConclusion;
  const font = 'Inter,Helvetica Neue,Arial,sans-serif';

  const fs = slide.text.length > 80 ? 58 : slide.text.length > 50 ? 68 : 82;
  const lh = fs * 1.45;
  const maxChars = Math.floor(17 * (82 / fs));
  const lines = wrapLines(slide.text, maxChars);
  const blockH = lines.length * lh;
  const startY = (H - blockH) / 2 + fs;

  if (useDark) {
    // Hook/conclusion : fond dégradé sombre, texte centré, accent coloré
    const hlColor = pt.hookHl;
    const textEls = lines.map((line, i) => {
      const y = startY + i * lh;
      const hl = slide.highlight || [];
      const matched = hl.find(h => line.toLowerCase().includes(h.toLowerCase()));
      if (matched) {
        const lo = line.toLowerCase().indexOf(matched.toLowerCase());
        const before = esc(line.slice(0, lo));
        const match = esc(line.slice(lo, lo + matched.length));
        const after = esc(line.slice(lo + matched.length));
        return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" font-family="${font}" font-weight="800"><tspan fill="${pt.hookText}">${before}</tspan><tspan fill="${hlColor}">${match}</tspan><tspan fill="${pt.hookText}">${after}</tspan></text>`;
      }
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" fill="${pt.hookText}" font-family="${font}" font-weight="800">${esc(line)}</text>`;
    }).join('\n  ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="hg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="${pt.hookBg1}"/>
      <stop offset="100%" stop-color="${pt.hookBg2}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hg)"/>
  <rect x="0" y="0" width="10" height="${H}" fill="${pt.hookAccent}"/>
  <rect x="${W - 10}" y="0" width="10" height="${H}" fill="${pt.hookAccent}" opacity="0.4"/>
  <text x="${PAD + 20}" y="68" font-size="20" fill="${pt.hookAccent}" font-family="${font}" font-weight="700" letter-spacing="5" opacity="0.9">PRÉVOIR UTILE</text>
  <line x1="${PAD + 20}" y1="88" x2="${W - PAD}" y2="88" stroke="${pt.hookAccent}" stroke-width="1.5" opacity="0.4"/>
  ${textEls}
  <line x1="${PAD + 20}" y1="${H - 100}" x2="${W - PAD}" y2="${H - 100}" stroke="${pt.hookAccent}" stroke-width="1.5" opacity="0.4"/>
  <text x="${PAD + 20}" y="${H - 68}" font-size="22" fill="${pt.hookText}" font-family="${font}" opacity="0.45">${idx + 1} / ${total}</text>
</svg>`;
  }

  // Info slides : fond clair, bande colorée à gauche, texte aligné gauche
  const xText = PAD + 50;
  const maxW = W - xText - PAD;
  const maxCharsInfo = Math.floor(maxChars * 0.92);
  const linesInfo = wrapLines(slide.text, maxCharsInfo);
  const blockHInfo = linesInfo.length * lh;
  const startYInfo = (H - blockHInfo) / 2 + fs;

  const textEls = linesInfo.map((line, i) => {
    const y = startYInfo + i * lh;
    const hl = slide.highlight || [];
    const matched = hl.find(h => line.toLowerCase().includes(h.toLowerCase()));
    if (matched) {
      const lo = line.toLowerCase().indexOf(matched.toLowerCase());
      const before = esc(line.slice(0, lo));
      const match = esc(line.slice(lo, lo + matched.length));
      const after = esc(line.slice(lo + matched.length));
      return `<text x="${xText}" y="${y}" font-size="${fs}" font-family="${font}" font-weight="700"><tspan fill="${pt.infoText}">${before}</tspan><tspan fill="${pt.infoHl}">${match}</tspan><tspan fill="${pt.infoText}">${after}</tspan></text>`;
    }
    return `<text x="${xText}" y="${y}" font-size="${fs}" fill="${pt.infoText}" font-family="${font}" font-weight="700">${esc(line)}</text>`;
  }).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${pt.infoBg}"/>
  <rect x="0" y="0" width="18" height="${H}" fill="${pt.infoStripe}"/>
  <rect x="0" y="0" width="18" height="${H}" fill="${pt.infoStripe}" opacity="1"/>
  <text x="${PAD - 10}" y="68" font-size="20" fill="${pt.infoStripe}" font-family="${font}" font-weight="700" letter-spacing="5" opacity="0.8">PRÉVOIR UTILE</text>
  <line x1="${PAD - 10}" y1="88" x2="${W - PAD}" y2="88" stroke="${pt.infoStripe}" stroke-width="1.5" opacity="0.3"/>
  ${textEls}
  <line x1="${PAD - 10}" y1="${H - 100}" x2="${W - PAD}" y2="${H - 100}" stroke="${pt.infoStripe}" stroke-width="1.5" opacity="0.3"/>
  <text x="${PAD - 10}" y="${H - 68}" font-size="22" fill="${pt.infoText}" font-family="${font}" opacity="0.35">${idx + 1} / ${total}</text>
</svg>`;
}

export function slidesToSvgs(slides: Slide[], postThemeIdx = 0): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length, postThemeIdx));
}
