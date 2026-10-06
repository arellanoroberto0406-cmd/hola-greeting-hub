import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { FONT_OPTIONS, type FontFamily, type GlobalStyles } from '@/types/storeLayout';
import '@/styles/store-typography.css';

export const fontName = (font: FontFamily) => FONT_OPTIONS.find(option => option.value === font)?.label || 'Hind';
export const fontWeights = (font: FontFamily): number[] => {
  const definition = FONT_OPTIONS.find(option => option.value === font)?.googleFont;
  if (font === 'archivo-black') return [400];
  const weights = definition?.split('@')[1]?.split(';').map(Number);
  return weights?.length ? weights : [400, 700];
};
export const resolvedWeight = (font: FontFamily, weight: number) =>
  fontWeights(font).reduce((nearest, candidate) => Math.abs(candidate - weight) < Math.abs(nearest - weight) ? candidate : nearest);
const bounded = (value: number | undefined, fallback: number, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function typographyVariables(styles: GlobalStyles): CSSProperties {
  return {
    '--store-heading-font': `'${fontName(styles.headingFont)}', sans-serif`,
    '--store-body-font': `'${fontName(styles.bodyFont)}', sans-serif`,
    '--store-heading-size': `${bounded(styles.headingSize, 32, 20, 56)}px`,
    '--store-body-size': `${bounded(styles.bodySize, 16, 12, 22)}px`,
    '--store-heading-weight': resolvedWeight(styles.headingFont, bounded(styles.headingWeight, 700, 300, 800)),
    '--store-body-weight': resolvedWeight(styles.bodyFont, bounded(styles.bodyWeight, 400, 300, 800)),
  } as CSSProperties;
}

export function typographyAttributes(styles: GlobalStyles) {
  return {
    'data-heading-size': styles.headingSize === undefined ? undefined : 'custom',
    'data-body-size': styles.bodySize === undefined ? undefined : 'custom',
    'data-heading-weight': styles.headingWeight === undefined ? undefined : 'custom',
    'data-body-weight': styles.bodyWeight === undefined ? undefined : 'custom',
  };
}

export function useStoreFonts(styles: GlobalStyles) {
  useEffect(() => {
    for (const font of [styles.headingFont, styles.bodyFont]) {
      const option = FONT_OPTIONS.find(candidate => candidate.value === font);
      if (!option || document.getElementById(`store-font-${font}`)) continue;
      const link = document.createElement('link');
      link.id = `store-font-${font}`;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${option.googleFont}&display=swap`;
      document.head.appendChild(link);
    }
  }, [styles.headingFont, styles.bodyFont]);
}