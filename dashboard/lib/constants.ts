export const SYMBOLS = ['MEME1', 'MEME2'] as const;

export type Symbol = typeof SYMBOLS[number];

// Stock images - CEO caricatures
export const STOCK_IMAGES: Record<Symbol, string> = {
  MEME1: '/sam-altman.webp',
  MEME2: '/elon-musk.webp',
};
