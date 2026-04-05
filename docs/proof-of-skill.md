# Proof of Skill — Reclaim Protocol Integration

TwinMarket verifies that agents are human-backed (World ID) but not that the human actually has the skills they claim. Reclaim Protocol fills this gap by generating zero-knowledge proofs from real platforms (LinkedIn, GitHub, Coursera) without exposing private data.

## How it works

Reclaim uses zkTLS (zero-knowledge TLS) to prove that data exists on a website without the website knowing. The user logs into their LinkedIn/GitHub/etc. inside a secure Reclaim environment. Reclaim intercepts the TLS response, generates a cryptographic proof of specific data points (job title, years of experience, contribution count), and returns that proof to our app. The proof is verifiable but reveals only what we ask for.

## Feasibility assessment

| Criteria | Verdict |
|----------|---------|
| JS SDK maturity | Good — v5.0.1, 117 releases, actively maintained (last push March 2026) |
| Solidity SDK maturity | Low — 2 stars, 1 fork, not recommended for MVP |
| Integration effort (off-chain) | ~4h for a single provider, ~8h for 2-3 providers |
| Integration effort (on-chain) | ~2-3 days — Semaphore merkle trees, complex flow, skip for MVP |
| UX impact | User must authenticate with the provider in a Reclaim window (similar to OAuth) |
| Dependencies | `@reclaimprotocol/js-sdk` pulls `ethers` v6 (~2MB), duplicates our `viem` setup but doesn't conflict |
| License | No standard OSS license — acceptable for hackathon, investigate before production |

### Risks

- **Provider lock-in**: Available data sources depend on Reclaim's Developer Portal (2500+ providers, but we don't control the list)
- **Callback URL must be public**: Local dev requires ngrok or a tunnel
- **ethers v6 duplication**: Bundle size increase (~2MB), no runtime conflict with viem
- **Reclaim downtime**: If their infrastructure goes down, verification fails — but it's not blocking (agent creation can proceed without proof)

## Architecture decision

**Off-chain verification only** for the MVP. Store proof metadata in our database. No EAS attestations, no ERC-8004, no Solidity verification.

Rationale:
- On-chain adds 2-3 days of complexity with no sponsor prize to justify it
- Off-chain proof is still cryptographically valid — we can verify it server-side
- On-chain can be added later by submitting stored proofs to a verifier contract

## Where it fits in the current stack

```
Current flow:
  Connect Wallet → World ID (Proof of Human) → Create Agent → ENS + AgentBook

With Reclaim:
  Connect Wallet → World ID (Proof of Human) → Verify Skills (Reclaim) → Create Agent → ENS + AgentBook
```

The verification step is optional — an agent can be created without skill proofs. Verified skills add a badge and increase trust, but don't gate creation.

## Database changes

Add a `skill_proofs` table to store verification results:

```sql
CREATE TABLE skill_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,        -- 'linkedin', 'github', 'coursera'
  claim_type TEXT NOT NULL,      -- 'job_title', 'contributions', 'certification'
  claim_value TEXT NOT NULL,     -- 'Senior Marketing Manager at Google'
  proof_hash TEXT NOT NULL,      -- hash of the zkProof for verification
  raw_proof JSONB NOT NULL,      -- full proof object from Reclaim
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, provider, claim_type)
);
```

In Drizzle ORM (following existing schema patterns in `src/lib/db/schema.ts`):

```typescript
export const skillProofs = pgTable('skill_proofs', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  claimType: text('claim_type').notNull(),
  claimValue: text('claim_value').notNull(),
  proofHash: text('proof_hash').notNull(),
  rawProof: jsonb('raw_proof').notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique().on(table.agentId, table.provider, table.claimType),
])
```

## MVP implementation guide

### Prerequisites

1. Create an app on [dev.reclaimprotocol.org](https://dev.reclaimprotocol.org)
2. Get your `APP_ID` and `APP_SECRET`
3. Pick a provider ID (start with LinkedIn job title — search "LinkedIn" in the portal)
4. Add env vars:

```env
RECLAIM_APP_ID=your_app_id
RECLAIM_APP_SECRET=your_app_secret
RECLAIM_LINKEDIN_PROVIDER_ID=provider_id_from_portal
```

### Step 1 — Install SDK

```bash
bun add @reclaimprotocol/js-sdk
```

### Step 2 — Server-side: create verification request

Add a tRPC router (e.g. `src/trpc/routers/skill-proof.ts`):

```typescript
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk'
import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'

export const skillProofRouter = router({
  createRequest: protectedProcedure
    .input(z.object({
      provider: z.enum(['linkedin', 'github', 'coursera']),
    }))
    .mutation(async ({ input }) => {
      const providerIds: Record<string, string> = {
        linkedin: process.env.RECLAIM_LINKEDIN_PROVIDER_ID!,
        github: process.env.RECLAIM_GITHUB_PROVIDER_ID!,
        coursera: process.env.RECLAIM_COURSERA_PROVIDER_ID!,
      }

      const reclaimRequest = await ReclaimProofRequest.init(
        process.env.RECLAIM_APP_ID!,
        process.env.RECLAIM_APP_SECRET!,
        providerIds[input.provider],
      )

      const { requestUrl, statusUrl } = await reclaimRequest.createVerificationRequest()

      return { requestUrl, statusUrl }
    }),

  verify: protectedProcedure
    .input(z.object({
      agentId: z.string().uuid(),
      provider: z.enum(['linkedin', 'github', 'coursera']),
      proofData: z.unknown(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the proof server-side
      const isValid = await ReclaimProofRequest.verifySignedProof(input.proofData)
      if (!isValid) {
        throw new Error('Invalid proof')
      }

      // Extract claim data from the proof
      const context = JSON.parse(input.proofData.claimData.context)
      const claimValue = context.extractedParameters?.title
        ?? context.extractedParameters?.contributions
        ?? JSON.stringify(context.extractedParameters)

      // Store in database
      // await db.insert(skillProofs).values({ ... })

      return { verified: true, claimValue }
    }),
})
```

### Step 3 — Client-side: trigger verification flow

In the agent creation wizard, add a step between World ID and the review page:

```tsx
'use client'

import { useState } from 'react'
import { api } from '@/trpc/react'

type Provider = 'linkedin' | 'github' | 'coursera'

const PROVIDERS: { id: Provider; label: string; description: string }[] = [
  { id: 'linkedin', label: 'LinkedIn', description: 'Verify your job title and experience' },
  { id: 'github', label: 'GitHub', description: 'Verify your contributions and repositories' },
  { id: 'coursera', label: 'Coursera', description: 'Verify your certifications' },
]

export function SkillVerificationStep({ agentId }: { agentId: string }) {
  const [verifiedProviders, setVerifiedProviders] = useState<Set<Provider>>(new Set())

  const createRequest = api.skillProof.createRequest.useMutation()
  const verify = api.skillProof.verify.useMutation()

  async function handleVerify(provider: Provider) {
    // 1. Get the verification URL from our server
    const { requestUrl } = await createRequest.mutateAsync({ provider })

    // 2. Open Reclaim verification in a new window
    const popup = window.open(requestUrl, '_blank', 'width=500,height=700')

    // 3. Listen for the proof via postMessage or polling statusUrl
    // The exact mechanism depends on Reclaim SDK version —
    // check their docs for the current callback pattern.
    // Once proof is received:
    // await verify.mutateAsync({ agentId, provider, proofData: proof })
    // setVerifiedProviders(prev => new Set([...prev, provider]))
  }

  return (
    <div>
      <h2>Verify your skills (optional)</h2>
      <p>Prove your expertise with zero-knowledge proofs from real platforms.</p>

      {PROVIDERS.map((p) => (
        <div key={p.id}>
          <h3>{p.label}</h3>
          <p>{p.description}</p>
          {verifiedProviders.has(p.id) ? (
            <span>Verified ✓</span>
          ) : (
            <button onClick={() => handleVerify(p.id)}>
              Verify with {p.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

### Step 4 — Display verified skills

On the agent detail page (`/twins/[slug]`), show verification badges:

```tsx
// Fetch skill proofs alongside agent data
// Display next to the "Human-backed ✓" badge:
// "LinkedIn Verified ✓" — Senior Marketing Manager at Google
// "GitHub Verified ✓" — 1,200+ contributions
```

### Step 5 — ENS text record (bonus)

When creating the agent, write an additional ENS text record:

```typescript
// In src/lib/ens.ts, add to the records written in registerEnsName:
{ key: 'reclaim.skills', value: 'linkedin:verified,github:verified' }
```

This makes skill verification discoverable on-chain via ENS resolution.

## Resources

| Resource | URL |
|----------|-----|
| Reclaim docs | https://docs.reclaimprotocol.org/ |
| Developer Portal (APP_ID + providers) | https://dev.reclaimprotocol.org/ |
| JS SDK | https://github.com/reclaimprotocol/reclaim-js-sdk |
| JS SDK quickstart | https://docs.reclaimprotocol.org/js/quickstart |
| Solidity SDK (future) | https://github.com/reclaimprotocol/reclaim-solidity-sdk |
| Solidity quickstart (future) | https://docs.reclaimprotocol.org/onchain/solidity/quickstart |
| ERC-8004 validator (future) | https://github.com/reclaimprotocol/reclaim-8004-validator |

## Future extensions (post-hackathon)

These are documented for context but should NOT be built during the hackathon:

- **On-chain verification**: Submit proofs to Reclaim's Solidity verifier contract, store results via EAS attestations
- **ERC-8004 integration**: Use the `reclaim-8004-validator` as a validation hook in the ERC-8004 registry
- **Multi-provider aggregation**: Require N providers to reach a "trust score" threshold
- **Skill expiry**: Proofs older than X months trigger re-verification
- **Peer review layer**: Domain experts validate claims that can't be proved via platforms
