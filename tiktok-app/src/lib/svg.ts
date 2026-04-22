import type { Slide } from '@/types/content';

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function wrap(text: string, max: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur.trim());
  return lines;
}

export function slideToSvg(slide: Slide, idx: number, total: number): string {
  const dark = slide.type === 'hook';
  const bg = dark ? '#2B2B2B' : '#F5F0E8';
  const fg = dark ? '#FFFFFF' : '#2B2B2B';
  const fs = slide.text.length > 60 ? 52 : 64;
  const lh = fs * 1.45;
  const lines = wrap(slide.text, dark ? 18 : 24);
  const totalH = lines.length * lh;
  const startY = (1920 - totalH) / 2 + fs;

  const dots = Array.from({ length: total }, (_, i) =>
    `<circle cx="${(1080 - total * 18) / 2 + i * 18 + 9}" cy="1860" r="${i === idx ? 6 : 3}" fill="${i === idx ? '#F6E27A' : (dark ? '#555' : '#ccc')}"/>`
  ).join('');

  const textLines = lines.map((line, i) => {
    const y = startY + i * lh;
    const hl = slide.highlight || [];
    let decorated = esc(line);
    for (const h of hl) {
      decorated = decorated.replace(esc(h), `<tspan fill="#F6E27A">${esc(h)}</tspan>`);
    }
    return `<text x="540" y="${y}" text-anchor="middle" font-size="${fs}" fill="${fg}" font-family="Georgia,serif" font-weight="700">${decorated}</text>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <rect width="1080" height="1920" fill="${bg}"/>
  <rect x="80" y="60" width="920" height="2" fill="${dark?'#444':'#D6A77A'}" opacity="0.5"/>
  <text x="540" y="50" text-anchor="middle" font-size="26" fill="${dark?'#666':'#AAA'}" font-family="Georgia,serif" letter-spacing="2">PRÉVOIR SANS PANIQUER</text>
  ${textLines}
  <rect x="80" y="1880" width="920" height="2" fill="${dark?'#444':'#D6A77A'}" opacity="0.5"/>
  ${dots}
</svg>`;
}

export function slidesToSvgs(slides: Slide[]): string[] {
  return slides.map((s, i) => slideToSvg(s, i, slides.length));
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
