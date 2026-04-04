# World ID Verification — Design Spec

## Scope

Integrate World ID proof-of-humanity as a gate after wallet connection (SIWE). One human = one verified account. Accepts both Orb and Device verification levels, displaying the level as a trust indicator.

This is the first integration step. AgentKit/AgentBook registration and agent creation are out of scope.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UX flow | Verify at connect | Linear onboarding, max demo impact for World judges, no intermediate unverified state |
| Verification levels | Accept both, display level | Orb = higher trust badge, Device = accessible for demo. Judges without Orb can still test |
| Nullifier storage | Columns on `users` table | 1:1 relationship, no unnecessary JOIN, hackathon simplicity |
| Approach | IDKit widget + custom wrapper | Widget handles ZK proof flow reliably; wrapper adds business logic (gate, badge, state) |

## Database Schema Changes

Add 3 columns to the existing `users` table:

```sql
ALTER TABLE users
  ADD COLUMN nullifier_hash VARCHAR(255) UNIQUE,
  ADD COLUMN verification_level VARCHAR(20),
  ADD COLUMN verified_at TIMESTAMP;
```

- `nullifier_hash`: unique constraint enforces one-human-one-account globally (even across different wallets)
- `verification_level`: `'orb'` or `'device'` — used for trust badges
- `verified_at`: timestamp of successful verification

## Backend — tRPC Router

New router: `worldId` with a query `status` and a mutation `verify`.

**Query `status`** (`protectedProcedure`):
- Returns `{ isVerified: boolean, verificationLevel: string | null }` from the current user's DB record.

**Procedure type**: `protectedProcedure` (requires SIWE session).

**Input schema** (Zod):
```
{
  proof: string
  merkle_root: string
  nullifier_hash: string
  verification_level: string
}
```

**Flow**:
1. Receive proof payload from frontend
2. Call `verifyCloudProof()` from `@worldcoin/idkit` with:
   - proof payload
   - `app_id` from `NEXT_PUBLIC_WLD_APP_ID` env var
   - `action: "verify-humanity"`
   - `signal: user's wallet address` (from session)
3. If `verifyCloudProof` returns failure → throw `TRPCError` BAD_REQUEST
4. Check nullifier uniqueness: query DB for existing `nullifier_hash` → if found, throw `CONFLICT` ("This World ID is already linked to another account")
5. Check user not already verified: if current user has `nullifier_hash` → throw `BAD_REQUEST` ("Already verified")
6. Update user record: set `nullifier_hash`, `verification_level`, `verified_at`
7. Return `{ success: true, verificationLevel: string }`

## Frontend — WorldIdGate Component

A layout-level gate component placed in `src/app/protected/layout.tsx`.

**Behavior**:
- Fetches current user's verification status via tRPC query (`worldId.status`) that returns `{ isVerified: boolean, verificationLevel: string | null }`
- If verified → render children normally
- If not verified → render verification screen with IDKitWidget trigger

**IDKitWidget configuration**:
```tsx
<IDKitWidget
  app_id={process.env.NEXT_PUBLIC_WLD_APP_ID}
  action="verify-humanity"
  signal={walletAddress}
  verification_level={VerificationLevel.Device}
  handleVerify={sendProofToBackend}
  onSuccess={refreshAndProceed}
>
  {({ open }) => <Button onClick={open}>Verify with World ID</Button>}
</IDKitWidget>
```

- `verification_level: Device` = minimum accepted. Orb-verified users pass too (higher trust).
- `signal: walletAddress` = ties the proof to the specific wallet
- `handleVerify` = calls tRPC `worldId.verify` mutation. If it throws, IDKit shows error screen.
- `onSuccess` = fires only after `handleVerify` succeeds. Refreshes user state so the gate opens.

**Verification screen UI** (minimal for hackathon):
- Heading: "Verify your humanity"
- Subtext: "TwinMarket requires World ID verification to ensure every user is a real, unique human."
- Button: "Verify with World ID" → opens IDKit modal
- After success: auto-redirect to dashboard content

## Full User Flow

```
1. User lands on twinmarket.xyz
2. Clicks "Connect Wallet" → RainbowKit modal → signs SIWE message
3. Redirected to /protected
4. WorldIdGate checks: nullifierHash on user?
   → NO:  Shows "Verify your humanity" screen
          → User clicks "Verify with World ID"
          → IDKit modal opens (QR code / deep link to World App)
          → User proves humanity in World App
          → handleVerify sends proof to tRPC worldId.verify
          → Backend verifies via Cloud API + stores nullifier
          → onSuccess fires → user state refreshes → gate opens
   → YES: Renders dashboard / protected content
```

## Packages

**Install**: `@worldcoin/idkit`

No other packages needed for this scope.

## Environment Variables

Already configured in `.env`:
- `NEXT_PUBLIC_WLD_APP_ID` — client-side, passed to IDKitWidget
- `WLD_RP_SIGNING_KEY` — server-side, for proof verification if needed

**World Developer Portal configuration required**:
- Create action: `verify-humanity`
- Enable signal support

## Out of Scope

- AgentKit / AgentBook registration
- Agent creation form or `agents` table
- Rate limiting on verify mutation
- Re-verification or revocation flow
- Removing the `posts` table (deferred to agent creation iteration)
- Mobile-responsive verification UI
