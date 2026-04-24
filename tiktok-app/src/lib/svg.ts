import type { Slide } from '@/types/content';

const W = 1080;
const H = 1920;
const PAD = 90;

// 5 thèmes — chaque post en prend un différent pour varier le feed
const POST_THEMES = [
  // 0 — NOIR + JAUNE (original bold)
  {
    hookBg: '#2B2B2B', hookText: '#FFFFFF', hookHl: '#F6E27A', hookAccent: '#F6E27A',
    infoBg: ['#F5EDD5', '#FEFBF0'], infoText: '#2B2B2B', infoHl: '#B85C20', infoAccent: '#7B4F2A',
  },
  // 1 — VERT FORÊT + OLIVE
  {
    hookBg: '#2A3D18', hookText: '#F5F0E2', hookHl: '#A8BC5A', hookAccent: '#A8BC5A',
    infoBg: ['#F5F0E2', '#C8D4A2'], infoText: '#2A3D18', infoHl: '#B85C20', infoAccent: '#6B7C2A',
  },
  // 2 — CRAFT BRUN + JAUNE (papier kraft chaud)
  {
    hookBg: '#6B4226', hookText: '#FFF3DC', hookHl: '#F6E27A', hookAccent: '#F0D080',
    infoBg: ['#F0DFB8', '#E8CFA0'], infoText: '#3A2810', infoHl: '#6B4226', infoAccent: '#8B6030',
  },
  // 3 — VERT CLAIR SAUGE
  {
    hookBg: '#4A6741', hookText: '#F0F5E8', hookHl: '#E8D870', hookAccent: '#C8E090',
    infoBg: ['#D4E8C2', '#EAF2D8'], infoText: '#2A3D18', infoHl: '#B85C20', infoAccent: '#4A6741',
  },
  // 4 — NOTE PERSONNELLE (crème chaud, intimiste)
  {
    hookBg: '#3A3228', hookText: '#FEFDF5', hookHl: '#D4C048', hookAccent: '#C8B040',
    infoBg: ['#FEFDF5', '#FFF8E8'], infoText: '#3A3228', infoHl: '#8B6914', infoAccent: '#9A8030',
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

function bgExtras(isHook: boolean, postTheme: number, infoAlt: number, accent: string): string {
  if (isHook) {
    // Craft theme: petits points texturés
    if (postTheme === 2) {
      return `<defs><pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="14" cy="14" r="1.5" fill="${accent}" opacity="0.25"/>
      </pattern></defs>
      <rect width="${W}" height="${H}" fill="url(#dots)"/>`;
    }
    return '';
  }

  // Info slides
  if (postTheme === 0 || postTheme === 1 || postTheme === 4) {
    // Lignes horizontales style carnet/note
    if (infoAlt === 0) {
      return Array.from({ length: 17 }, (_, i) =>
        `<line x1="${PAD}" y1="${290 + i * 92}" x2="${W - PAD}" y2="${290 + i * 92}" stroke="${accent}" stroke-width="1.5" opacity="0.22"/>`
      ).join('\n  ');
    }
    // Fiche : bordure intérieure arrondie
    return `<rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="24" fill="none" stroke="${accent}" stroke-width="3" opacity="0.25"/>`;
  }

  if (postTheme === 2) {
    // Craft : lignes + texture dots
    return `<defs><pattern id="dots2" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="1.2" fill="${accent}" opacity="0.18"/>
    </pattern></defs>
    <rect width="${W}" height="${H}" fill="url(#dots2)"/>
    ${Array.from({ length: 15 }, (_, i) =>
      `<line x1="${PAD}" y1="${320 + i * 98}" x2="${W - PAD}" y2="${320 + i * 98}" stroke="${accent}" stroke-width="1.5" opacity="0.2"/>`
    ).join('\n    ')}`;
  }

  if (postTheme === 3) {
    // Vert clair : ovales feuilles
    return `<ellipse cx="980" cy="1820" rx="72" ry="28" fill="${accent}" opacity="0.20" transform="rotate(-40 980 1820)"/>
  <ellipse cx="900" cy="1870" rx="55" ry="22" fill="${accent}" opacity="0.14" transform="rotate(-55 900 1870)"/>
  <ellipse cx="105" cy="95" rx="55" ry="22" fill="${accent}" opacity="0.14" transform="rotate(40 105 95)"/>
  <ellipse cx="180" cy="55" rx="40" ry="16" fill="${accent}" opacity="0.10" transform="rotate(30 180 55)"/>`;
  }

  return '';
}

export function slideToSvg(slide: Slide, idx: number, total: number, postThemeIdx = 0): string {
  const pt = POST_THEMES[postThemeIdx % POST_THEMES.length];
  const isHook = slide.type === 'hook';
  const isConclusion = slide.type === 'conclusion';
  const useDark = isHook || isConclusion;
  const infoAlt = idx % 2;

  const bg = useDark ? pt.hookBg : pt.infoBg[infoAlt];
  const textColor = useDark ? pt.hookText : pt.infoText;
  const hlColor = useDark ? pt.hookHl : pt.infoHl;
  const accent = useDark ? pt.hookAccent : pt.infoAccent;

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
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" font-family="Georgia,serif" font-weight="700"><tspan fill="${textColor}">${before}</tspan><tspan fill="${hlColor}">${match}</tspan><tspan fill="${textColor}">${after}</tspan></text>`;
    }
    return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${fs}" fill="${textColor}" font-family="Georgia,serif" font-weight="700">${esc(line)}</text>`;
  }).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  ${bgExtras(useDark, postThemeIdx % 5, infoAlt, accent)}
  <rect x="${PAD}" y="94" width="${W - PAD * 2}" height="2" fill="${accent}" opacity="0.55"/>
  <rect x="${PAD}" y="${H - 114}" width="${W - PAD * 2}" height="2" fill="${accent}" opacity="0.55"/>
  <text x="${W / 2}" y="62" text-anchor="middle" font-size="24" fill="${accent}" font-family="Georgia,serif" letter-spacing="4" font-weight="700">PRÉVOIR UTILE</text>
  ${textEls}
  <text x="${W / 2}" y="${H - 68}" text-anchor="middle" font-size="26" fill="${textColor}" font-family="Georgia,serif" opacity="0.35">${idx + 1} / ${total}</text>
</svg>`;
}

export function slidesToSvgs(slides: Slide[], postThemeIdx = 0): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length, postThemeIdx));
}
