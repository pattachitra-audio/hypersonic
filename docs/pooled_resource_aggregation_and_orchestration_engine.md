# Pooled Resource Aggregation and Orchestration Engine (PRAOE)

## Overview

PRAOE is a platform that aggregates multiple independent resource accounts into a unified, session-bound pool and orchestrates spending across them. A resource is anything spendable — API credits, storage quotas, monetary balances, or any abstract consumable. PRAOE treats many small, separate accounts as one large logical resource, routing spend operations intelligently across the pool.

---

## Core Concepts

### Resource

A resource is any spendable unit. To be managed by PRAOE, a resource type must expose two capabilities:

- **Fetch Balance** — query the current remaining amount
- **Spend** — consume a specified amount

Any system that implements these two operations can plug into PRAOE as a resource type (API credits, cloud storage, currency balances, etc.).

### Account

An account is a single instance of a resource. For example, one API key with its own credit balance. A user may own many accounts of the same resource type.

### Pool

A pool is a collection of accounts of the same resource type. The pool represents the aggregated total of all individual account balances, presented to the user as a single logical resource.

### Session

A session is a time-bound context in which a user claims a subset of their accounts from the pool. Once a session is created, the claimed accounts are exclusively locked to that session. No other session can access or spend from them until they are released.

---

## How It Works

### 1. Session Initialization

1. User selects a subset of accounts (e.g., 8–10 out of 20–30 available accounts).
2. PRAOE atomically locks all selected accounts to the new session.
3. Current balances are fetched from each account and stored as local state.
4. The session is now active — the user sees one aggregated balance across all locked accounts.

### 2. Spend Operations

1. User requests a spend operation (e.g., "make this API call costing ~50 credits").
2. PRAOE selects an account from the session's pool using the configured **selection strategy**.
3. The spend operation is executed against the selected account.
4. On success: the local balance for that account is updated (deducted).
5. On failure (insufficient credits): PRAOE retries with the next eligible account, up to a configured **retry limit**.
6. If all retries are exhausted: the operation fails and the user is notified.

### 3. Session Termination

1. User ends the session (or restores a crashed session).
2. All locked accounts are released back to the available pool.
3. Final balances are recorded.

---

## Account Locking

### Purpose

Locking ensures exclusive ownership of accounts within a session. When accounts are locked to a session, no other session can claim or spend from them.

### Lock Properties

| Property     | Description                          |
| ------------ | ------------------------------------ |
| `account_id` | The account being locked             |
| `session_id` | The session that owns the lock       |
| `locked_at`  | Timestamp when the lock was acquired |
| `status`     | `FREE` or `LOCKED`                   |

### Lock Rules

- **Atomic acquisition**: When a session requests N accounts, all N must be locked in a single atomic operation. Partial locks are not allowed — either all requested accounts are locked, or the session creation fails.
- **Session-scoped ownership**: Only the owning session can spend from or release a locked account. Every spend operation verifies `locked_by == current_session_id` before proceeding.
- **Persisted lock state**: Lock information is persisted to storage, not just held in memory. This ensures that if the process crashes, the system still knows which accounts belong to which session.
- **No automatic TTL/expiry**: Locks do not expire automatically. If a session crashes, the user can view crashed sessions and manually restore or release them.

### Contention Handling

If a user requests more accounts than are currently free, the system should either:

- Reject the session creation and inform the user how many accounts are available, or
- Allow partial allocation if the user opts in.

---

## Balance Management

### Source of Truth

During an active session, the **local state is the source of truth**. Balances are tracked in-memory and updated after each spend operation.

### Reconciliation

The local state can be reconciled with the actual remote balance by re-fetching. Reconciliation should occur:

- **On session initialization** — always fetch real balances at the start.
- **On spend failure** — if a spend fails unexpectedly, re-fetch the account's actual balance before retrying.
- **On session restoration** — if recovering from a crash, re-fetch all balances.
- Optionally, **periodically** during long-running sessions.

---

## Retry Mechanism

When a spend operation fails due to insufficient credits on the selected account:

1. Update the local balance for the failed account (re-fetch actual balance).
2. Select the next eligible account from the session's pool using the selection strategy.
3. Retry the spend operation.
4. Repeat up to the configured retry limit.
5. If all retries are exhausted, fail the operation and report to the user which accounts were attempted and their current balances.

---

## Account Selection Strategies

The strategy for choosing which account to spend from is pluggable. Possible strategies include:

| Strategy                  | Description                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Largest Balance First** | Pick the account with the highest balance. Maximizes success probability.                                                 |
| **Smallest Sufficient**   | Pick the account with the smallest balance that can still cover the cost. Preserves large balances for bigger operations. |
| **Round Robin**           | Cycle through accounts evenly. Distributes wear across accounts.                                                          |
| **Random**                | Pick a random eligible account. Simple and avoids predictable patterns.                                                   |

Strategy selection is configurable per session or per resource type.

---

## Open Design Questions

- **Concurrent spends within a session**: Can a session issue multiple spend operations in parallel? If yes, per-account locking within the session or serialization of spend operations is needed to avoid double-selection.
- **Mid-session account management**: Can a user add or remove accounts from an active session, or must they end and recreate?
- **Cross-session visibility**: Should a user be able to see the balances of accounts locked by their other active sessions?
- **Fairness / quotas**: Should there be limits on how many accounts a single user can lock across all their sessions?
