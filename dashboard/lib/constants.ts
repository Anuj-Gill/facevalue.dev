export const SYMBOLS = ['SAMA', 'MUKS', 'HKRT', 'PAAJI'] as const;

export type Symbol = typeof SYMBOLS[number];

export const STOCK_IMAGES: Record<Symbol, string> = {
  SAMA: '/stocks/sam.webp',
  MUKS: '/stocks/musk.webp',
  HKRT: '/stocks/harkirat.webp',
  PAAJI: '/stocks/paaji.webp',
};

export const PERSON_NAMES: Record<Symbol, string> = {
  SAMA: 'Sam Altman',
  MUKS: 'Elon Musk',
  HKRT: 'Harkirat Singh',
  PAAJI: 'Maanu Arora',
}
