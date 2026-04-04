import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type {
  agentSkillTable,
  agentTable,
  userAccountTable,
  userSessionTable,
  userTable,
  userVerificationTable,
  walletAddressTable,
} from './schema';

export type User = InferSelectModel<typeof userTable>;
export type NewUser = InferInsertModel<typeof userTable>;

export type UserWithRelations = User & {
  accounts: UserAccount[];
  sessions: UserSession[];
  walletAddresses: WalletAddress[];
};

export type UserAccount = InferSelectModel<typeof userAccountTable>;
export type UserSession = InferSelectModel<typeof userSessionTable>;
export type UserVerification = InferSelectModel<typeof userVerificationTable>;
export type WalletAddress = InferSelectModel<typeof walletAddressTable>;

export type Agent = InferSelectModel<typeof agentTable>;
export type NewAgent = InferInsertModel<typeof agentTable>;

export type AgentSkill = InferSelectModel<typeof agentSkillTable>;
export type NewAgentSkill = InferInsertModel<typeof agentSkillTable>;

export type AgentWithSkills = Agent & {
  skills: AgentSkill[];
};

export type AgentPublic = Pick<
  Agent,
  'name' | 'slug' | 'description' | 'avatarUrl' | 'totalCalls' | 'status' | 'ensName' | 'walletAddress' | 'pricePerCall'
>;
