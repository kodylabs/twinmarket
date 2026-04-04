import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

const timeColumns = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
};

export const userTable = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  avatarUrl: text('avatar_url'),
  phone: varchar('phone', { length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  nullifierHash: varchar('nullifier_hash', { length: 255 }).unique(),
  verificationLevel: varchar('verification_level', { length: 20 }),
  verifiedAt: timestamp('verified_at'),
  ...timeColumns,
});

export const userTableRelations = relations(userTable, ({ many }) => ({
  accounts: many(userAccountTable),
  sessions: many(userSessionTable),
  walletAddresses: many(walletAddressTable),
  agents: many(agentTable),
}));

// https://www.better-auth.com/docs/concepts/database#session
export const userSessionTable = pgTable('user_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 255 }),
  userAgent: varchar('user_agent', { length: 255 }),
  ...timeColumns,
});

export const userSessionTableRelations = relations(userSessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userSessionTable.userId],
    references: [userTable.id],
  }),
}));

// https://www.better-auth.com/docs/concepts/database#account
export const userAccountTable = pgTable('user_accounts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => userTable.id),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: varchar('scope', { length: 255 }),
  idToken: text('id_token'),
  password: varchar('password', { length: 255 }),
  ...timeColumns,
});

export const userAccountTableRelations = relations(userAccountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userAccountTable.userId],
    references: [userTable.id],
  }),
}));

// https://www.better-auth.com/docs/concepts/database#verification
export const userVerificationTable = pgTable('user_verifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  ...timeColumns,
});

// https://www.better-auth.com/docs/plugins/siwe
export const walletAddressTable = pgTable('wallet_addresses', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  address: varchar('address', { length: 42 }).notNull(),
  chainId: integer('chain_id').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const walletAddressTableRelations = relations(walletAddressTable, ({ one }) => ({
  user: one(userTable, {
    fields: [walletAddressTable.userId],
    references: [userTable.id],
  }),
}));

// --- Agents ---

export const agentTable = pgTable('agents', {
  id: varchar('id', { length: 255 }).primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  avatarUrl: text('avatar_url'),
  systemPrompt: text('system_prompt').notNull(),
  creatorId: varchar('creator_id', { length: 255 })
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  totalCalls: integer('total_calls').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  ...timeColumns,
});

export const agentTableRelations = relations(agentTable, ({ one, many }) => ({
  creator: one(userTable, {
    fields: [agentTable.creatorId],
    references: [userTable.id],
  }),
  skills: many(agentSkillTable),
}));

export const agentSkillTable = pgTable('agent_skills', {
  id: varchar('id', { length: 255 }).primaryKey(),
  agentId: varchar('agent_id', { length: 255 })
    .notNull()
    .references(() => agentTable.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 20 }).notNull().default('prompt'),
  sortOrder: integer('sort_order').notNull().default(0),
  ...timeColumns,
});

export const agentSkillTableRelations = relations(agentSkillTable, ({ one }) => ({
  agent: one(agentTable, {
    fields: [agentSkillTable.agentId],
    references: [agentTable.id],
  }),
}));
