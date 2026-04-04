import { describe, expect, test } from 'bun:test';
import { WORLD_ID_ACTION } from '../world-id';

describe('World ID constants', () => {
  test('ACTION_ID is verify-humanity', () => {
    expect(WORLD_ID_ACTION).toBe('verify-humanity');
  });
});
