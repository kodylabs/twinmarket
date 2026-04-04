import { describe, expect, test } from 'bun:test';
import { getTableColumns } from 'drizzle-orm';
import { userTable } from '../schema';

describe('userTable schema', () => {
  test('has nullifierHash column', () => {
    const columns = getTableColumns(userTable);
    expect(columns.nullifierHash).toBeDefined();
    expect(columns.nullifierHash.dataType).toBe('string');
  });
  test('has verificationLevel column', () => {
    const columns = getTableColumns(userTable);
    expect(columns.verificationLevel).toBeDefined();
    expect(columns.verificationLevel.dataType).toBe('string');
  });
  test('has verifiedAt column', () => {
    const columns = getTableColumns(userTable);
    expect(columns.verifiedAt).toBeDefined();
    expect(columns.verifiedAt.dataType).toBe('date');
  });
  test('nullifierHash has unique constraint', () => {
    const columns = getTableColumns(userTable);
    expect(columns.nullifierHash.isUnique).toBe(true);
  });
  test('all three World ID columns are nullable', () => {
    const columns = getTableColumns(userTable);
    expect(columns.nullifierHash.notNull).toBe(false);
    expect(columns.verificationLevel.notNull).toBe(false);
    expect(columns.verifiedAt.notNull).toBe(false);
  });
});
