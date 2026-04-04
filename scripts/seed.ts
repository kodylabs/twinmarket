import { db, postTable, userTable } from '../src/lib/db';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.delete(postTable);
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
