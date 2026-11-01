import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { FONT_OPTIONS, type FontFamily, type GlobalStyles, type TypographyDevice, type TypographySettings } from '@/types/storeLayout';
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

export function deviceTypography(styles: GlobalStyles, device: TypographyDevice): TypographySettings {
  return { headingSize: styles.headingSize, bodySize: styles.bodySize, headingWeight: styles.headingWeight, bodyWeight: styles.bodyWeight, ...styles.responsiveTypography?.[device] };
}

export function updateDeviceTypography(styles: GlobalStyles, device: TypographyDevice, key: keyof TypographySettings, value: number): GlobalStyles {
  return { ...styles, responsiveTypography: { ...styles.responsiveTypography, [device]: { ...styles.responsiveTypography?.[device], [key]: value } } };
}

export function typographyVariables(styles: GlobalStyles, device?: TypographyDevice): CSSProperties {
  const active = device ? deviceTypography(styles, device) : styles;
  const responsive: Record<string, string | number> = {};
  for (const screen of ['mobile', 'tablet', 'desktop'] as const) {
    const settings = deviceTypography(styles, screen);
    responsive[`--store-${screen}-heading-size`] = `${bounded(settings.headingSize, 32, 20, 56)}px`;
    responsive[`--store-${screen}-body-size`] = `${bounded(settings.bodySize, 16, 12, 22)}px`;
    responsive[`--store-${screen}-heading-weight`] = resolvedWeight(styles.headingFont, bounded(settings.headingWeight, 700, 300, 800));
    responsive[`--store-${screen}-body-weight`] = resolvedWeight(styles.bodyFont, bounded(settings.bodyWeight, 400, 300, 800));
  }
  return {
    ...responsive,
    '--store-heading-font': `'${fontName(styles.headingFont)}', sans-serif`,
    '--store-body-font': `'${fontName(styles.bodyFont)}', sans-serif`,
    '--store-heading-size': `${bounded(active.headingSize, 32, 20, 56)}px`,
    '--store-body-size': `${bounded(active.bodySize, 16, 12, 22)}px`,
    '--store-heading-weight': resolvedWeight(styles.headingFont, bounded(active.headingWeight, 700, 300, 800)),
    '--store-body-weight': resolvedWeight(styles.bodyFont, bounded(active.bodyWeight, 400, 300, 800)),
  } as CSSProperties;
}

export function typographyAttributes(styles: GlobalStyles) {
  const custom = (key: keyof TypographySettings) => styles[key] !== undefined || Object.values(styles.responsiveTypography ?? {}).some(settings => settings[key] !== undefined) ? 'custom' : undefined;
  return {
    'data-heading-size': custom('headingSize'),
    'data-body-size': custom('bodySize'),
    'data-heading-weight': custom('headingWeight'),
    'data-body-weight': custom('bodyWeight'),
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