import type { Slide } from '@/types/content';

// TikTok carousel format: 1080x1920 (9:16)
const W = 1080;
const H = 1920;
const PAD = 90;

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapLines(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (test.length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Arrow SVG path (pointing right → "swipe" indicator)
function arrowIcon(cx: number, cy: number, color: string): string {
  return `<g transform="translate(${cx - 12}, ${cy - 12})">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>`;
}

export function slideToSvg(slide: Slide, idx: number, total: number): string {
  const isHook = slide.type === 'hook';
  const bg = isHook ? '#2B2B2B' : '#F5F0E8';
  const textColor = isHook ? '#FFFFFF' : '#2B2B2B';

  // Font size based on text length
  const fs = slide.text.length > 80 ? 54 : slide.text.length > 50 ? 62 : 72;
  const lh = fs * 1.5;
  const maxChars = Math.floor(16 * (72 / fs));

  const lines = wrapLines(slide.text, maxChars);
  const blockH = lines.length * lh;
  // Center vertically (slightly above center for visual balance)
  const startY = (H - blockH) / 2 + fs * 0.8;

  // Highlight color: on dark bg use yellow, on light bg use terracotta (readable)
  const hlColor = isHook ? '#F6E27A' : '#C17A3A';

  const textEls = lines.map((line, i) => {
    const y = startY + i * lh;
    const hl = (slide.highlight || []).map(h => h.toLowerCase());
    // Check if this line contains a highlight word
    const lowerLine = line.toLowerCase();
    const matchedHl = hl.find(h => lowerLine.includes(h));

    if (matchedHl) {
      const origIdx = lowerLine.indexOf(matchedHl);
      const before = esc(line.slice(0, origIdx));
      const match = esc(line.slice(origIdx, origIdx + matchedHl.length));
      const after = esc(line.slice(origIdx + matchedHl.length));
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" dominant-baseline="auto"
        font-size="${fs}" font-family="Georgia,serif" font-weight="700">
        <tspan fill="${textColor}">${before}</tspan><tspan fill="${hlColor}" font-style="italic">${match}</tspan><tspan fill="${textColor}">${after}</tspan>
      </text>`;
    }

    return `<text x="${W / 2}" y="${y}" text-anchor="middle" dominant-baseline="auto"
      font-size="${fs}" fill="${textColor}" font-family="Georgia,serif" font-weight="700">${esc(line)}</text>`;
  }).join('\n');

  // Bottom: arrow + slide counter
  const bottomY = H - 70;
  const arrowColor = isHook ? '#888' : '#B0A898';
  const counterColor = isHook ? '#666' : '#B0A898';
  const bottomEl = idx < total - 1
    ? `${arrowIcon(W / 2, bottomY, arrowColor)}
       <text x="${W / 2 + 28}" y="${bottomY + 6}" text-anchor="middle" font-size="24" fill="${counterColor}" font-family="Georgia,serif">${idx + 1}/${total}</text>`
    : `<text x="${W / 2}" y="${bottomY + 6}" text-anchor="middle" font-size="24" fill="${counterColor}" font-family="Georgia,serif">💾 Sauvegarde si utile</text>`;

  // Top branding
  const topColor = isHook ? '#666' : '#B0A898';

  // Subtle background texture for light slides
  const texture = isHook ? '' : `
    <rect x="0" y="0" width="${W}" height="${H}" fill="#EDE8DE" opacity="0.4"/>
    <rect x="${PAD}" y="${PAD - 20}" width="${W - PAD * 2}" height="1" fill="#C8B9A8" opacity="0.6"/>
    <rect x="${PAD}" y="${H - PAD + 10}" width="${W - PAD * 2}" height="1" fill="#C8B9A8" opacity="0.6"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  ${texture}
  <text x="${W / 2}" y="${PAD}" text-anchor="middle" font-size="26"
    fill="${topColor}" font-family="Georgia,serif" letter-spacing="3">PRÉVOIR SANS PANIQUER</text>
  ${textEls}
  ${bottomEl}
</svg>`;
}

export function slidesToSvgs(slides: Slide[]): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length));
}

// Convert SVG string to PNG base64 using @resvg/resvg-js
export async function svgToPngBase64(svg: string): Promise<string> {
  const { Resvg } = await import('@resvg/resvg-js');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
  });
  const pngData = resvg.render();
  return pngData.asPng().toString('base64');
}

export async function slidesToPngs(slides: Slide[]): Promise<string[]> {
  const svgs = slidesToSvgs(slides);
  return Promise.all(svgs.map(svg => svgToPngBase64(svg)));
}
