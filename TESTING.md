● Here's my analysis of the project and a full discussion of how to approach testing.

---

What You're Testing

Your services follow a clear pattern:

1. Firebase auth flow: signInWithPassword → idToken + refreshToken → exchangeRefreshTokenForIDToken → fresh idToken
2. ElevenLabs public API: getUser, listVoicesQuery, textToSpeech, textToDialogue — authenticated via XI-API-KEY
3. ElevenLabs internal API: user, textToDialogue, enhanceDialogue — authenticated via Bearer token (the Firebase idToken)

All functions return Result<T, Error> via neverthrow, use undici for HTTP, and support proxy routing.

---

Recommended Testing Framework: Vitest

Use Vitest — not Jest. Reasons specific to your project:

- Your project uses TypeScript with ESM (moduleResolution: bundler). Vitest handles this natively. Jest requires painful configuration (ts-jest, babel-jest, extensionsToTreatAsEsm, etc.)
- Vitest integrates with pnpm workspaces cleanly
- Near-identical API to Jest, so no learning curve
- Fast parallel execution

---

Two Testing Strategies

Strategy 1: Integration Tests (Real HTTP Requests)

This is what your root testElevenLabsKey.ts files are already doing manually — but formalized into a real test suite.

What it tests: Whether the actual external API calls work correctly end-to-end with real credentials and a real proxy.

Setup:

- Store credentials in a .env.test file (never hardcoded)
- Write test files under src/services/**tests**/
- Tests call your actual service functions, which make real HTTP requests

Example flow:

test("full auth flow")
→ signInWithPassword(email, password, proxyURL)
→ assert result.isOk() and idToken exists
→ exchangeRefreshTokenForIDToken(refreshToken, proxyURL)
→ assert new idToken returned
→ user(newIdToken, proxyURL) [internal API]
→ assert user data returned

Pros:

- Catches real API breakage (endpoint changes, auth issues, schema drift)
- Tests the proxy routing works

Cons:

- Slow (real network calls)
- Requires live credentials and proxy
- Can hit rate limits
- Flaky if network is down

Best used for: Manual smoke tests and a dedicated "integration" test run (not every commit).

---

Strategy 2: Unit Tests with HTTP Mocking

Mock the HTTP layer. Your service functions do:

1. Build a request
2. Call fetch (via undici)
3. Parse the response with Zod
4. Return a Result

You can intercept at step 2 using undici's built-in MockAgent — this is the ideal approach because you're already using undici. No extra library needed.

Alternatively, MSW (Mock Service Worker) in Node mode is another solid option — it intercepts at the network level and lets you define handlers by URL pattern.

What it tests: Request construction, response parsing, Zod schema validation, Result wrapping, error paths.

Pros:

- Extremely fast, fully offline
- Reliable (no network flakiness)
- Tests your parsing/transformation logic (e.g. snake*case → camelCase, stripping user* prefix in getUser)
- Tests error paths (what happens when API returns 401, 500, malformed JSON)

Cons:

- Mocks can drift from reality if the real API changes

Best used for: Every commit in CI.

---

Concrete Recommendation

Run both in separate test runs:

┌─────────────┬───────────────────────────┬────────────┬───────────────────────────┐
│ Test type │ Framework │ HTTP layer │ When to run │
├─────────────┼───────────────────────────┼────────────┼───────────────────────────┤
│ Unit/mock │ Vitest + undici MockAgent │ Mocked │ Every commit, CI │
├─────────────┼───────────────────────────┼────────────┼───────────────────────────┤
│ Integration │ Vitest │ Real HTTP │ Manual / dedicated CI job │
└─────────────┴───────────────────────────┴────────────┴───────────────────────────┘

Use environment variables (.env.test) for all credentials. Use Vitest's --project or separate config files to keep them separate.

---

File Structure

src/
services/
firebase/
signInWithPassword/
index.ts
index.test.ts ← unit test (mocked)
index.integration.ts ← integration test (real)
exchangeRefreshTokenForIDToken/
...
elevenLabsAPI/
user/
index.ts
index.test.ts
elevenLabsInternalAPI/
user/
index.ts
index.test.ts

Or put them together in a **tests**/ folder per service.

---

What to Test Per Service

signInWithPassword:

- Happy path: returns idToken, refreshToken, localID, expiresIn
- Wrong password: returns Err (not a thrown exception)
- Network failure: returns Err
- Response schema mismatch: Zod parse failure → Err

exchangeRefreshTokenForIDToken:

- Happy path: returns new idToken, refreshToken
- Expired/invalid refresh token: returns Err

getUser (ElevenLabs public):

- Happy path: user data returned, camelCase transformed, user\_ prefix stripped
- Invalid API key: Err

elevenLabsInternalAPI/user:

- Happy path: user data returned with Bearer token
- Expired Bearer token: Err

Auth chain integration test:

- signInWithPassword → use idToken → elevenLabsInternalAPI/user → verify it works end-to-end

---

Setup Steps (when you're ready to implement)

pnpm add -D vitest @vitest/runner dotenv

Add to package.json:
"scripts": {
"test": "vitest run",
"test:integration": "vitest run --project integration"
}

Create vitest.config.ts at root. Create .env.test with credentials (gitignored). Write test files.

---

The key insight: your testElevenLabsKey.ts files are already doing the right thing conceptually — they're just informal scripts. Vitest + a proper test structure turns them into reliable, repeatable, structured tests you can run consistently.

✻ Brewed for 2m 4s
