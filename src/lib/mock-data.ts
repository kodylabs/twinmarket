export interface TwinCardData {
  slug: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  creatorAddress: string;
  rating: number;
  totalCalls: number;
  priceEth: number;
  verified: boolean;
  verificationLevel: 'orb' | 'device' | null;
  tags: string[];
}

export interface OwnerTransaction {
  id: string;
  agentVersion: string;
  date: string;
  amount: number;
  status: 'settled' | 'pending';
}

export interface OwnerDashboardData {
  totalRevenue: number;
  usageCount: number;
  activeUsers: number;
  agent: {
    name: string;
    description: string;
    status: string;
    version: string;
  };
  transactions: OwnerTransaction[];
}

export const MOCK_TWINS: TwinCardData[] = [
  {
    slug: 'nexus-strategist',
    name: 'Nexus Strategist',
    description: 'Autonomous market analysis and cross-chain yield optimization specialist.',
    avatarUrl: null,
    creatorAddress: 'alara.eth',
    rating: 4.9,
    totalCalls: 1200,
    priceEth: 0.02,
    verified: true,
    verificationLevel: 'orb',
    tags: ['DeFi', 'Yield', 'Analysis'],
  },
  {
    slug: 'lex-ai-oracle',
    name: 'Lex AI Oracle',
    description: 'Expert smart contract auditing and legal-code translation agent.',
    avatarUrl: null,
    creatorAddress: 'lex_node.eth',
    rating: 4.8,
    totalCalls: 840,
    priceEth: 0.05,
    verified: true,
    verificationLevel: 'device',
    tags: ['Legal', 'Audit', 'Smart Contracts'],
  },
  {
    slug: 'forge-creative',
    name: 'Forge Creative',
    description: 'Generative brand identity and high-conversion ad copy specialist.',
    avatarUrl: null,
    creatorAddress: 'forge.eth',
    rating: 5.0,
    totalCalls: 3400,
    priceEth: 0.01,
    verified: false,
    verificationLevel: null,
    tags: ['Branding', 'Copywriting', 'Design'],
  },
  {
    slug: 'prism-analyst',
    name: 'Prism Analyst',
    description: 'Multi-dimensional data analysis and predictive modeling agent.',
    avatarUrl: null,
    creatorAddress: 'prism.eth',
    rating: 4.99,
    totalCalls: 5200,
    priceEth: 0.03,
    verified: true,
    verificationLevel: 'orb',
    tags: ['Data', 'Prediction', 'Analytics'],
  },
  {
    slug: 'ghost-ops',
    name: 'Ghost Ops',
    description: 'Stealth operations and security threat assessment specialist.',
    avatarUrl: null,
    creatorAddress: 'ghost.eth',
    rating: 4.95,
    totalCalls: 3800,
    priceEth: 0.04,
    verified: true,
    verificationLevel: 'orb',
    tags: ['Security', 'Ops', 'Threat Intel'],
  },
  {
    slug: 'neural-link',
    name: 'Neural Link',
    description: 'Advanced neural network architecture design and optimization.',
    avatarUrl: null,
    creatorAddress: 'neural.eth',
    rating: 4.92,
    totalCalls: 2900,
    priceEth: 0.025,
    verified: true,
    verificationLevel: 'device',
    tags: ['ML', 'Architecture', 'Optimization'],
  },
  {
    slug: 'auto-scribe',
    name: 'Auto Scribe',
    description: 'Automated documentation and technical writing agent.',
    avatarUrl: null,
    creatorAddress: 'scribe.eth',
    rating: 4.88,
    totalCalls: 1800,
    priceEth: 0.008,
    verified: true,
    verificationLevel: 'orb',
    tags: ['Documentation', 'Writing', 'API'],
  },
  {
    slug: 'data-weaver',
    name: 'Data Weaver',
    description: 'Multimodal data transformation and scraping.',
    avatarUrl: null,
    creatorAddress: 'silas.eth',
    rating: 4.7,
    totalCalls: 420,
    priceEth: 0.005,
    verified: true,
    verificationLevel: 'orb',
    tags: ['Data', 'ETL', 'Scraping'],
  },
  {
    slug: 'eco-trader',
    name: 'Eco Trader',
    description: 'ESG-focused automated investment management.',
    avatarUrl: null,
    creatorAddress: 'terra.eth',
    rating: 4.6,
    totalCalls: 310,
    priceEth: 0.012,
    verified: false,
    verificationLevel: null,
    tags: ['ESG', 'Trading', 'Investment'],
  },
  {
    slug: 'script-sage',
    name: 'Script Sage',
    description: 'Advanced Python and Rust optimization assistant.',
    avatarUrl: null,
    creatorAddress: 'coder_x.eth',
    rating: 4.5,
    totalCalls: 280,
    priceEth: 0.015,
    verified: true,
    verificationLevel: 'device',
    tags: ['Python', 'Rust', 'Performance'],
  },
];

export const MOCK_TRENDING = MOCK_TWINS.slice(0, 3);
export const MOCK_TOP_RANKED = MOCK_TWINS.slice(3, 7);
export const MOCK_NEW_ARRIVALS = MOCK_TWINS.slice(7, 10);

export const MOCK_MARKETPLACE_STATS = {
  totalAgents: 1247,
  totalTransactions: 89420,
  totalVolumeEth: 342.8,
};

export const MOCK_OWNER_DASHBOARD: OwnerDashboardData = {
  totalRevenue: 12482.5,
  usageCount: 42800,
  activeUsers: 1204,
  agent: {
    name: 'Atlas Core',
    description:
      'High-fidelity financial analyst twin. Specializing in recursive treasury management and yield optimization on Ethereum L2s.',
    status: 'active',
    version: 'v2.4',
  },
  transactions: [
    { id: '0x3f...91d2', agentVersion: 'Atlas v2.4', date: '2026-03-21', amount: 1240.0, status: 'settled' },
    { id: '0x7a...44e9', agentVersion: 'Atlas v2.4', date: '2026-03-19', amount: 890.5, status: 'settled' },
    { id: '0x12...b8cc', agentVersion: 'Atlas v2.3', date: '2026-03-18', amount: 2100.0, status: 'settled' },
    { id: '0x99...ef01', agentVersion: 'Atlas v2.4', date: '2026-03-17', amount: 45.0, status: 'pending' },
  ],
};

export const MOCK_TWIN_DETAIL = {
  pricing: {
    baseAgentCost: 0.35,
    aiTokenCost: 0.12,
    protocolFee: 0.03,
    total: 0.5,
  },
  latency: '1.2s',
  trustScore: '98%',
  activity: [
    { text: 'Latest usage 2m ago', by: '0x71...f3a' },
    { text: 'New review posted', time: '14h ago' },
  ],
  reviews: [
    {
      name: 'saturn_v.eth',
      rating: 5,
      text: "Incredible nuance. It didn't just give generic advice; it pointed out exactly where my monetization model was leaking. Worth 10x the USDC fee.",
    },
    {
      name: 'cryptomama.eth',
      rating: 5,
      text: 'Fast responses and high precision. Used it for our seed round deck and got great feedback from VCs on the structure it suggested.',
    },
  ],
};
