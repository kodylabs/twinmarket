import { describe, expect, test } from 'bun:test';
import { worldIdRouter } from '../world-id';

describe('worldId router', () => {
  test('exports a router with status query', () => {
    expect(worldIdRouter).toBeDefined();
    expect(worldIdRouter._def.procedures.status).toBeDefined();
  });
  test('exports a router with rpContext query', () => {
    expect(worldIdRouter._def.procedures.rpContext).toBeDefined();
  });
  test('exports a router with verify mutation', () => {
    expect(worldIdRouter._def.procedures.verify).toBeDefined();
  });
});
