import type { Slide } from '@/types/content';

const W = 1080;
const H = 1920;
const PAD = 90;

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

export function slideToSvg(slide: Slide, idx: number, total: number): string {
  const isHook = slide.type === 'hook';
  const bg = isHook ? '#2B2B2B' : '#F5F0E8';
  const textColor = isHook ? '#FFFFFF' : '#2B2B2B';
  const fs = slide.text.length > 80 ? 52 : slide.text.length > 50 ? 62 : 72;
  const lh = fs * 1.55;
  const maxChars = Math.floor(18 * (72 / fs));
  const lines = wrapLines(slide.text, maxChars);
  const blockH = lines.length * lh;
  const startY = (H - blockH) / 2 + fs;
  const hlColor = isHook ? '#F6E27A' : '#B85C20';

  const textEls = lines.map((line, i) => {
    const y = startY + i * lh;
    const hl = (slide.highlight || []);
    const matched = hl.find(h => line.toLowerCase().includes(h.toLowerCase()));
    if (matched) {
      const lo = line.toLowerCase().indexOf(matched.toLowerCase());
      const before = esc(line.slice(0, lo));
      const match = esc(line.slice(lo, lo + matched.length));
      const after = esc(line.slice(lo + matched.length));
      return `<text x="${W/2}" y="${y}" text-anchor="middle" font-size="${fs}" font-family="Georgia,serif" font-weight="700"><tspan fill="${textColor}">${before}</tspan><tspan fill="${hlColor}">${match}</tspan><tspan fill="${textColor}">${after}</tspan></text>`;
    }
    return `<text x="${W/2}" y="${y}" text-anchor="middle" font-size="${fs}" fill="${textColor}" font-family="Georgia,serif" font-weight="700">${esc(line)}</text>`;
  }).join('\n');

  const arrowColor = isHook ? '#666' : '#C8B9A8';
  const isLast = idx === total - 1;
  const bottomY = H - 80;
  const bottomEl = isLast
    ? `<text x="${W/2}" y="${bottomY}" text-anchor="middle" font-size="28" fill="${arrowColor}" font-family="Georgia,serif">Sauvegarde si utile 💾</text>`
    : `<g transform="translate(${W/2 - 20},${bottomY - 20})">
        <line x1="0" y1="10" x2="32" y2="10" stroke="${arrowColor}" stroke-width="3" stroke-linecap="round"/>
        <polyline points="22,2 32,10 22,18" fill="none" stroke="${arrowColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <text x="${W/2 + 24}" y="${bottomY}" text-anchor="middle" font-size="24" fill="${arrowColor}" font-family="Georgia,serif">${idx+1}/${total}</text>`;

  const topColor = isHook ? '#666' : '#C8B9A8';
  const sep = isHook ? '' : `<rect x="${PAD}" y="85" width="${W-PAD*2}" height="1" fill="#C8B9A8" opacity="0.5"/>
    <rect x="${PAD}" y="${H-100}" width="${W-PAD*2}" height="1" fill="#C8B9A8" opacity="0.5"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  ${sep}
  <text x="${W/2}" y="62" text-anchor="middle" font-size="26" fill="${topColor}" font-family="Georgia,serif" letter-spacing="3">PRÉVOIR SANS PANIQUER</text>
  ${textEls}
  ${bottomEl}
</svg>`;
}

export function slidesToSvgs(slides: Slide[]): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length));
}
