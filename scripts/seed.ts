import { agentSkillTable, agentTable, db, userTable } from '../src/lib/db';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data (respect FK order)
  await db.delete(agentSkillTable);
  await db.delete(agentTable);
  await db.delete(userTable);

  // Create users
  const [alice, bob] = await db
    .insert(userTable)
    .values([
      {
        id: '1',
        username: 'alice',
        email: 'alice@example.com',
      },
      {
        id: '2',
        username: 'bob',
        email: 'bob@example.com',
      },
    ])
    .returning();

  console.log(`✅ Created ${2} users`);

  // Create posts
  await db.insert(postTable).values([
    {
      id: '1',
      title: 'Getting Started with Drizzle ORM',
      content: 'Drizzle ORM is a TypeScript-first ORM that provides excellent type safety...',
      published: 'true',
      authorId: alice.id,
    },
    {
      id: '2',
      title: 'Building Modern APIs',
      content: 'Modern API development requires careful consideration of many factors...',
      published: 'true',
      authorId: alice.id,
    },
    {
      id: '3',
      title: 'Draft: Upcoming Features',
      content: 'This is a draft post about upcoming features...',
      published: 'false',
      authorId: bob.id,
    },
  ]);

  console.log(`✅ Created ${3} posts`);

  // Create test agent
  const [agent] = await db
    .insert(agentTable)
    .values([
      {
        id: '1',
        slug: 'solidity-expert',
        name: 'Solidity Expert',
        description:
          'A digital twin of a senior Solidity developer with deep knowledge of smart contract patterns, security, and gas optimization.',
        systemPrompt:
          'You are a senior Solidity developer and smart contract auditor. You provide precise, security-focused advice about Solidity development, EVM internals, gas optimization, and smart contract design patterns. Always consider security implications in your answers. If you are unsure about something, say so rather than guessing.',
        creatorId: alice.id,
        status: 'active',
      },
    ])
    .returning();

  // Create skills for the agent
  await db.insert(agentSkillTable).values([
    {
      id: '1',
      agentId: agent.id,
      title: 'Gas Optimization Patterns',
      content:
        'You have deep expertise in gas optimization: use calldata instead of memory for external function parameters, pack storage variables into 32-byte slots, use unchecked blocks for arithmetic that cannot overflow, prefer mappings over arrays for lookups, use custom errors instead of revert strings, and cache storage reads in local variables.',
      type: 'prompt',
      sortOrder: 0,
    },
    {
      id: '2',
      agentId: agent.id,
      title: 'Common Vulnerability Patterns',
      content:
        'You can identify and explain common smart contract vulnerabilities: reentrancy (cross-function and cross-contract), integer overflow/underflow (pre-0.8), front-running and sandwich attacks, access control issues, oracle manipulation, flash loan attacks, and storage collision in proxies. You always recommend the checks-effects-interactions pattern.',
      type: 'document',
      sortOrder: 1,
    },
    {
      id: '3',
      agentId: agent.id,
      title: 'ERC Standards Knowledge',
      content:
        'You are deeply familiar with ERC standards: ERC-20 (fungible tokens), ERC-721 (NFTs), ERC-1155 (multi-token), ERC-4626 (tokenized vaults), ERC-2612 (permit), and ERC-1967 (proxy storage slots). You can explain implementation details, common pitfalls, and best practices for each.',
      type: 'document',
      sortOrder: 2,
    },
  ]);

  console.log(`✅ Created 1 agent with 3 skills`);
  console.log('🎉 Seeding completed!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
