import type { Slide } from '@/types/tiktok';

// Color palette — kraft/beige aesthetic
const PALETTE = {
  bg: '#F5F0E8',         // kraft beige
  bgDark: '#2B2B2B',     // dark variant
  text: '#2B2B2B',
  textLight: '#FFFFFF',
  highlight: '#F6E27A',  // soft yellow marker
  highlightAlt: '#A3B18A', // olive green
  accent: '#D6A77A',     // terracotta
  grain: '#E8E0D0',
};

const SLIDE_W = 1080;
const SLIDE_H = 1920;
const FONT_HOOK = 72;
const FONT_BODY = 56;
const FONT_SMALL = 44;
const PADDING = 80;

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

function buildHighlightedText(text: string, highlights: string[], x: number, y: number, fontSize: number, color: string): string {
  if (!highlights || highlights.length === 0) {
    return `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${color}" font-family="Georgia, serif" font-weight="700">${escapeXml(text)}</text>`;
  }

  let result = `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${color}" font-family="Georgia, serif" font-weight="700">`;
  let remaining = text;

  for (const hl of highlights) {
    const idx = remaining.toLowerCase().indexOf(hl.toLowerCase());
    if (idx === -1) continue;

    const before = remaining.slice(0, idx);
    const match = remaining.slice(idx, idx + hl.length);
    remaining = remaining.slice(idx + hl.length);

    if (before) result += `<tspan>${escapeXml(before)}</tspan>`;
    result += `<tspan style="background-color:${PALETTE.highlight}">${escapeXml(match)}</tspan>`;
  }

  if (remaining) result += `<tspan>${escapeXml(remaining)}</tspan>`;
  result += '</text>';
  return result;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generateSlideSvg(slide: Slide, slideIndex: number, totalSlides: number): string {
  const isHook = slide.type === 'hook';
  const bg = isHook ? PALETTE.bgDark : PALETTE.bg;
  const textColor = isHook ? PALETTE.textLight : PALETTE.text;
  const fontSize = isHook ? FONT_HOOK : (slide.text.length > 80 ? FONT_SMALL : FONT_BODY);
  const maxChars = isHook ? 20 : 28;

  const lines = wrapText(slide.text, maxChars);
  const lineHeight = fontSize * 1.4;
  const totalTextH = lines.length * lineHeight;
  const startY = (SLIDE_H - totalTextH) / 2 + fontSize;

  let textElements = '';
  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    const highlights = slide.highlight || [];
    textElements += buildHighlightedText(line, highlights, SLIDE_W / 2, y, fontSize, textColor);
  });

  // Progress dots
  const dotY = SLIDE_H - 60;
  const dotSpacing = 20;
  const dotsW = totalSlides * dotSpacing;
  const dotsStartX = (SLIDE_W - dotsW) / 2;
  let dots = '';
  for (let i = 0; i < totalSlides; i++) {
    const cx = dotsStartX + i * dotSpacing + dotSpacing / 2;
    const active = i === slideIndex;
    dots += `<circle cx="${cx}" cy="${dotY}" r="${active ? 6 : 4}" fill="${active ? PALETTE.highlight : (isHook ? '#666' : '#ccc')}" />`;
  }

  // Top logo text
  const logoY = 50;
  const logoText = 'Prévoir sans paniquer';
  const logoColor = isHook ? '#999' : '#AAA';

  // Texture overlay (subtle grain)
  const grain = isHook ? '' : `
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>
    <rect width="${SLIDE_W}" height="${SLIDE_H}" fill="${PALETTE.grain}" filter="url(#grain)" opacity="0.3"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SLIDE_W}" height="${SLIDE_H}" viewBox="0 0 ${SLIDE_W} ${SLIDE_H}">
  <defs>${grain.includes('filter') ? grain : ''}</defs>
  <!-- Background -->
  <rect width="${SLIDE_W}" height="${SLIDE_H}" fill="${bg}"/>
  ${!isHook && grain ? `<rect width="${SLIDE_W}" height="${SLIDE_H}" fill="${PALETTE.grain}" opacity="0.15"/>` : ''}

  <!-- Top accent line -->
  <rect x="${PADDING}" y="70" width="${SLIDE_W - PADDING * 2}" height="2" fill="${isHook ? '#444' : PALETTE.accent}" opacity="0.5"/>

  <!-- Logo -->
  <text x="${SLIDE_W / 2}" y="${logoY}" text-anchor="middle" font-size="28" fill="${logoColor}" font-family="Georgia, serif" letter-spacing="2">
    ${escapeXml(logoText.toUpperCase())}
  </text>

  <!-- Main text — centered -->
  <g text-anchor="middle">
    ${textElements}
  </g>

  <!-- Highlight blocks for highlighted words -->
  <!-- (handled inline in text elements) -->

  <!-- Bottom accent line -->
  <rect x="${PADDING}" y="${SLIDE_H - 90}" width="${SLIDE_W - PADDING * 2}" height="2" fill="${isHook ? '#444' : PALETTE.accent}" opacity="0.5"/>

  <!-- Progress dots -->
  ${dots}
</svg>`;
}

export function generateCarouselSvgs(slides: Slide[]): string[] {
  return slides.map((slide, i) => generateSlideSvg(slide, i, slides.length));
}

export function svgToDataUrl(svg: string): string {
  const base64 = Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export interface SlideImageData {
  svg: string;
  dataUrl: string;
  filename: string;
}

export function generateSlideImages(slides: Slide[], contentId: string): SlideImageData[] {
  return slides.map((slide, i) => {
    const svg = generateSlideSvg(slide, i, slides.length);
    return {
      svg,
      dataUrl: svgToDataUrl(svg),
      filename: `${contentId}_slide_${i + 1}.svg`,
    };
  });
}
