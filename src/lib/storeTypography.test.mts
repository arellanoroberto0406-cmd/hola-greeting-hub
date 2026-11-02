/// <reference types="node" />
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_GLOBAL_STYLES } from '../types/storeLayout';
import { deviceTypography, updateDeviceTypography } from './storeTypography';

describe('Independent typography per store and screen', () => {
  for (const device of ['mobile', 'tablet', 'desktop'] as const) {
    for (const [key, value] of [['headingSize', 40], ['bodySize', 18], ['headingWeight', 600], ['bodyWeight', 500]] as const) {
      test(`${device} ${key} changes only the selected screen`, () => {
        const original = { ...DEFAULT_GLOBAL_STYLES, headingSize: 32, bodySize: 16, headingWeight: 700, bodyWeight: 400 };
        const changed = updateDeviceTypography(original, device, key, value);
        assert.equal(deviceTypography(changed, device)[key], value);
        for (const other of ['mobile', 'tablet', 'desktop'] as const) {
          if (other !== device) assert.equal(deviceTypography(changed, other)[key], original[key]);
        }
        assert.equal(original.responsiveTypography, undefined);
        const saved = JSON.parse(JSON.stringify(changed));
        assert.equal(deviceTypography(saved, device)[key], value);
      });
    }
  }
});