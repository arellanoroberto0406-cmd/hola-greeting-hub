import { describe, expect, test } from 'bun:test';
import { DEFAULT_GLOBAL_STYLES } from '../types/storeLayout';
import { deviceTypography, updateDeviceTypography } from './storeTypography';

describe('Independent typography per store and screen', () => {
  for (const device of ['mobile', 'tablet', 'desktop'] as const) {
    for (const [key, value] of [['headingSize', 40], ['bodySize', 18], ['headingWeight', 600], ['bodyWeight', 500]] as const) {
      test(`${device} ${key} changes only the selected screen`, () => {
        const original = { ...DEFAULT_GLOBAL_STYLES, headingSize: 32, bodySize: 16, headingWeight: 700, bodyWeight: 400 };
        const changed = updateDeviceTypography(original, device, key, value);
        expect(deviceTypography(changed, device)[key]).toBe(value);
        for (const other of ['mobile', 'tablet', 'desktop'] as const) {
          if (other !== device) expect(deviceTypography(changed, other)[key]).toBe(original[key]);
        }
        expect(original.responsiveTypography).toBeUndefined();
        const saved = JSON.parse(JSON.stringify(changed));
        expect(deviceTypography(saved, device)[key]).toBe(value);
      });
    }
  }
});