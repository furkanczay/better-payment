import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { VERSION } from '../../src/version';

describe('VERSION', () => {
  it('matches package.json', () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));
    expect(VERSION).toBe(pkg.version);
  });
});
