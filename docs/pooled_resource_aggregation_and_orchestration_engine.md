# Pooled Resource Aggregation and Orchestration Engine (PRAOE)

## Overview

PRAOE is a platform that aggregates multiple independent resource accounts into a unified pool and orchestrates operations across them. A resource is anything with limits — API credits, storage quotas, rate limits, or any abstract consumable. PRAOE treats many small, separate accounts as one large logical resource, routing operations intelligently across the pool.

---

## Core Concepts

### Resource

A resource is any account-bound capability with limits. A single resource (e.g., a Google account) may expose multiple kinds of limits — storage, API rate limits, credits — each of which is managed independently.

To be managed by PRAOE, a resource type must expose two capabilities per lane (see Lanes below):

- **Fetch Balance** — query the current remaining amount (credits, storage, rate limit headroom, etc.)
- **Spend** — consume a specified amount

Any system that implements these two operations can plug into PRAOE as a resource type.

### Account

An account is a single instance of a resource. For example, one ElevenLabs API key with its own credit balance, or one Google account with its own storage quota and rate limits. A user may own many accounts of the same resource type.

### Pool

A pool is the complete collection of all accounts of the same resource type owned by a user. The pool represents everything available — the full inventory from which subsets are drawn for specific jobs.

### Allocation

An allocation is a subset of accounts selected from the pool for a specific job. When a user starts a task (e.g., generating an audiobook), they create an allocation by choosing N accounts out of the pool (e.g., 20 out of 100 ElevenLabs accounts). Allocated accounts are locked to the job — no other allocation can use them until they are released.

### Lane

A lane is a category of API usage within a resource type, each with its own limits and orchestration requirements. Different lanes of the same resource type may require completely different routing strategies.

For example, an ElevenLabs account exposes three lanes:

| Lane                  | Limit Type         | Example                                | Routing Strategy                      |
| --------------------- | ------------------ | -------------------------------------- | ------------------------------------- |
| **Free Lane**         | None               | `/shared-voices` (list voices)         | Any account (no orchestration needed) |
| **Rate-Limited Lane** | Requests/time      | `/enhance-dialogue` (2–4 req/10 min)   | Round Robin                           |
| **Credit Lane**       | Consumable credits | `/text-to-speech`, `/text-to-dialogue` | Largest Balance First                 |

Similarly, a Google account exposes lanes such as:

| Lane             | Limit Type     | Example                 |
| ---------------- | -------------- | ----------------------- |
| **Storage Lane** | 15 GB capacity | Google Drive storage    |
| **Mail Lane**    | Sends/day      | Gmail sending limits    |
| **AI Lane**      | Free credits   | Gemini API free tier    |
| **Cloud Lane**   | Compute hours  | GCP free-tier resources |

Lanes are defined per resource type and are independent of each other. An account can be drained on one lane while still having full capacity on another.

### Capacity Profile

A capacity profile is the per-lane breakdown of limits for either a single account or an entire allocation.

**Account-level capacity profile** (single ElevenLabs account):

| Lane         | Capacity        |
| ------------ | --------------- |
| Free         | Unlimited       |
| Rate-Limited | ~4 req / 10 min |
| Credit       | 10,000 credits  |

**Allocation-level capacity profile** (20 accounts allocated):

| Lane         | Aggregate Capacity |
| ------------ | ------------------ |
| Free         | Unlimited          |
| Rate-Limited | ~80 req / 10 min   |
| Credit       | 200,000 credits    |

Capacity is always lane-scoped, never a single number for the entire allocation.

### Routing Strategy

A routing strategy is the algorithm that governs how a lane selects which account to use for a given operation. Strategies are configured per lane, not per allocation.

| Strategy                  | Description                                                                                                               | Best For           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| **Largest Balance First** | Pick the account with the highest remaining balance. Maximizes success probability.                                       | Credit lanes       |
| **Smallest Sufficient**   | Pick the account with the smallest balance that can still cover the cost. Preserves large balances for bigger operations. | Credit lanes       |
| **Round Robin**           | Cycle through accounts evenly. Distributes load across accounts.                                                          | Rate-limited lanes |
| **Random**                | Pick a random eligible account. Simple and avoids predictable patterns.                                                   | Free lanes         |
| **Least Recently Used**   | Pick the account that hasn't been used the longest. Maximizes rate limit recovery time.                                   | Rate-limited lanes |

### Drain

A drain occurs when an individual account exhausts its capacity on a specific lane. A drained account is removed from rotation for that lane but remains available for other lanes where it still has capacity.

---

## How It Works

### 1. Allocation Initialization

1. User selects a subset of accounts from the pool (e.g., 20 out of 100 available accounts).
2. PRAOE atomically locks all selected accounts to the new allocation.
3. Current balances are fetched from each account across all relevant lanes and stored as local state (the allocation's capacity profile).
4. The allocation is now active — the user sees aggregated capacity per lane across all locked accounts.

### 2. Spend Operations

1. User requests an operation (e.g., "convert this dialogue to speech costing ~200 credits").
2. PRAOE identifies the appropriate lane for the operation (e.g., credit lane for TTS).
3. The lane's routing strategy selects an account from the allocation.
4. The operation is executed against the selected account.
5. On success: the local balance for that account on that lane is updated.
6. On failure (insufficient balance or rate limit hit): PRAOE retries with the next eligible account per the routing strategy, up to a configured retry limit.
7. If all retries are exhausted: the operation fails and the user is notified.

### 3. Allocation Termination

1. User ends the allocation (or restores a crashed allocation).
2. All locked accounts are released back to the pool.
3. Final balances are recorded per lane.

---

## Account Locking

### Purpose

Locking ensures exclusive ownership of accounts within an allocation. When accounts are locked, no other allocation can claim or spend from them.

### Lock Properties

| Property        | Description                          |
| --------------- | ------------------------------------ |
| `account_id`    | The account being locked             |
| `allocation_id` | The allocation that owns the lock    |
| `locked_at`     | Timestamp when the lock was acquired |
| `status`        | `FREE` or `LOCKED`                   |

### Lock Rules

- **Atomic acquisition**: When an allocation requests N accounts, all N must be locked in a single atomic operation. Partial locks are not allowed — either all requested accounts are locked, or the allocation creation fails.
- **Allocation-scoped ownership**: Only the owning allocation can spend from or release a locked account. Every spend operation verifies `locked_by == current_allocation_id` before proceeding.
- **Persisted lock state**: Lock information is persisted to storage, not just held in memory. This ensures that if the process crashes, the system still knows which accounts belong to which allocation.
- **No automatic TTL/expiry**: Locks do not expire automatically. If an allocation crashes, the user can view crashed allocations and manually restore or release them.

### Contention Handling

If a user requests more accounts than are currently free in the pool, the system should either:

- Reject the allocation creation and inform the user how many accounts are available, or
- Allow partial allocation if the user opts in.

---

## Balance Management

### Source of Truth

During an active allocation, the **local state is the source of truth**. Balances are tracked in-memory per lane and updated after each operation.

### Reconciliation

The local state can be reconciled with the actual remote balance by re-fetching. Reconciliation should occur:

- **On allocation initialization** — always fetch real balances across all lanes at the start.
- **On spend failure** — if a spend fails unexpectedly, re-fetch the account's actual balance for that lane before retrying.
- **On allocation restoration** — if recovering from a crash, re-fetch all balances across all lanes.
- Optionally, **periodically** during long-running allocations.

---

## Retry Mechanism

When a spend operation fails due to insufficient balance or rate limit exhaustion on the selected account:

1. Update the local balance for the failed account on the relevant lane (re-fetch actual balance).
2. If the account is now drained on this lane, mark it as drained and remove it from rotation for this lane.
3. Select the next eligible account using the lane's routing strategy.
4. Retry the operation.
5. Repeat up to the configured retry limit.
6. If all retries are exhausted, fail the operation and report to the user which accounts were attempted and their current lane balances.

---

## Open Design Questions

- **Concurrent operations within an allocation**: Can an allocation issue multiple spend operations in parallel on the same lane? If yes, per-account locking within the lane or serialization of operations is needed to avoid double-selection.
- **Mid-allocation account management**: Can a user add or remove accounts from an active allocation, or must they terminate and recreate?
- **Cross-allocation visibility**: Should a user be able to see the balances of accounts locked by their other active allocations?
- **Cross-lane drain awareness**: When an account drains on one lane, should other lanes be notified or adjust their strategies?
- **Lane discovery**: Should lanes be statically defined per resource type, or can users define custom lanes?
- **Fairness / quotas**: Should there be limits on how many accounts a single user can lock across all their allocations?
