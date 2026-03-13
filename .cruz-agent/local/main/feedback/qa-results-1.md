# QA Results #1

## Verdict: NEEDS_WORK

## Summary
- Total Tests: 15
- Passed: 5
- Failed: 8
- Skipped: 2 (blocked by auth/hydration failure)

## Root Cause Analysis

Two CRITICAL issues prevent nearly all interactive features from working:

### CRITICAL Issue 1: Server-only module leaked to client bundle

**Files affected:**
- `src/routes/index.tsx` (line 10)
- `src/features/subreddits/routes/subreddits._index.tsx` (line 7)
- `src/features/subreddits/routes/subreddits.$name.tsx` (line 9)

Each of these files has `import '@/setup.server'` at the **module level** (top of the file, outside of `loader`). React Router automatically strips server code from `loader`, `action`, etc., but cannot strip top-level imports that other exports also depend on.

**Error message from Vite:**
```
Server-only module referenced by client
'src/setup.server' imported by route 'src/routes/index.tsx'
React Router automatically removes server-code from these exports:
  `loader`, `action`, `middleware`, `headers`
But other route exports in 'src/routes/index.tsx' depend on 'src/setup.server'.
```

**Impact:** This returns HTTP 500 when the client requests the route module for hydration. As a result, **React never hydrates** on these pages. All client-side interactivity is completely broken:
- Sort tabs do not switch
- tRPC queries do not execute client-side
- Join/Leave buttons do not work
- Vote buttons do not work
- Comment submission does not work

**Fix:** Move the `import '@/setup.server'` inside the `loader` function, or use a `.server.ts` suffix for the import so React Router can properly tree-shake it. Example:
```typescript
// BEFORE (broken):
import '@/setup.server';
export const loader = async (args) => { ... };

// AFTER (fixed):
export const loader = async (args) => {
  await import('@/setup.server');
  // ... rest of loader
};
```

### CRITICAL Issue 2: Missing `registerOrgTRPC(trpc)` call

**File affected:** `src/trpc/client.ts` or `src/root.tsx`

The `AppLayout` from `@cruzjs/start/layout` includes an `OrgSwitcher` component that calls `useCurrentOrg()`, which requires `registerOrgTRPC(trpc)` to have been called during app setup. This call is missing.

**Error:**
```
Error: OrgTRPC not registered. Call registerOrgTRPC(trpc) during app setup.
  at getTRPC (org.hooks.ts:14:9)
  at useCurrentOrg (org.hooks.ts:22:15)
  at OrgSwitcher (OrgSwitcher.tsx:28:49)
```

**Impact:** When a user is logged in, the OrgSwitcher component in the navbar crashes, causing React to unmount the entire component tree. This makes the app unusable for authenticated users -- creating communities, creating posts, joining/leaving, voting, commenting are all blocked.

**Fix:** Add `registerOrgTRPC(trpc)` in `src/trpc/client.ts`:
```typescript
import { registerOrgTRPC } from '@cruzjs/start/orgs';
// ... after creating trpc
registerOrgTRPC(trpc);
```

## Test Results

### Passed Tests
1. **01-Homepage SSR** - Page loads with HTTP 200, "Home" heading renders, no loading spinner (SSR works correctly)
2. **02-Communities page** - Page loads with HTTP 200, "Communities" heading renders
3. **03-Sign-in CTA (home)** - Sign In and Get Started buttons visible in both main content and sidebar
4. **03-Sign-in CTA (communities)** - Sign In and Get Started links visible on communities page
5. **Edge-404 nonexistent community** - `/r/nonexistent_xyz123` correctly returns HTTP 404

### Failed Tests

1. **04-Registration & Auth**
   - Steps to reproduce:
     1. Navigate to `/auth/register`
     2. Fill all fields (name, email, password, confirm password, invite code)
     3. Check terms checkbox
     4. Submit
   - Expected: User is logged in, redirected to home, sees authenticated UI
   - Actual: Registration succeeds (redirects to `/orgs/new?onboarding=true`), but org creation page crashes with `OrgTRPC not registered` error. After navigating to home, user appears not logged in.
   - Severity: CRITICAL
   - Screenshot: `04-auth-home.png`

2. **05-Create community**
   - Steps to reproduce:
     1. Register/login
     2. Navigate to `/subreddits/create`
     3. Fill name, title, description
     4. Submit
   - Expected: Community created, redirected to `/r/{name}`
   - Actual: Blocked by OrgSwitcher crash (vite-error-overlay appears after login)
   - Severity: CRITICAL (blocked by Issue 2)
   - Screenshot: `05-create-community.png`

3. **06-Join/Leave community**
   - Steps to reproduce: Navigate to `/subreddits`, click Join on a community
   - Expected: Button changes to "Joined", member count increments
   - Actual: No communities exist (empty DB) and no Join buttons visible. Also blocked by hydration failure -- buttons would not work even if communities existed.
   - Severity: CRITICAL (blocked by Issue 1)
   - Screenshot: `06-communities-list.png`

4. **07-Create post**
   - Blocked by: Auth failure (Issue 2) and hydration failure (Issue 1)
   - Severity: CRITICAL

5. **10-Sort tabs (home)**
   - Steps to reproduce:
     1. Navigate to `/`
     2. Click "Top" tab
   - Expected: "Top" tab becomes active (bg-indigo-600), "New" tab becomes inactive
   - Actual: Nothing happens. Buttons remain static because React hydration failed.
   - Severity: HIGH (blocked by Issue 1)
   - Screenshot: `10-sort-top.png`

6. **11-Moderator tools**
   - Steps to reproduce: Navigate to a community where user is moderator
   - Expected: "Mod Tools" link and "Remove" button visible on posts
   - Actual: Blocked by auth/hydration failures
   - Severity: HIGH (blocked by Issues 1 and 2)

7. **Edge-Post without membership**
   - Steps to reproduce: Navigate to a community, try New Post without joining
   - Expected: "Join first" message or disabled button
   - Actual: Blocked by auth failure; tested code review shows correct behavior (disabled button with `cursor-not-allowed` class and "Join this community first" message on click)
   - Severity: MEDIUM (code looks correct, could not verify in browser)

8. **Login flow (admin@example.com)**
   - Steps to reproduce: Navigate to `/auth/login`, enter credentials, submit
   - Expected: Login succeeds
   - Actual: Login form submits but vite-error-overlay blocks interaction. Likely returns a server error. No test users exist in DB.
   - Severity: HIGH

### Skipped Tests
1. **08-Vote on post** - Blocked: no post could be created
2. **09-Comment on post** - Blocked: no post could be created

## Edge Cases Tested

| Case | Result | Notes |
|------|--------|-------|
| Empty data (no posts) | PASS | Shows "No posts yet" with CTA |
| Empty data (no communities) | PASS | Shows "No communities yet" with CTA |
| Nonexistent community (/r/xyz) | PASS | Returns proper 404 |
| Post without membership | BLOCKED | Code review confirms correct behavior |
| Special chars in title | BLOCKED | Could not create post |
| Sort tabs | FAIL | React hydration broken |
| Login with test credentials | FAIL | Server 500, likely no users seeded |

## Console Errors

1. **`500 Internal Server Error`** on `/src/routes/index.tsx` - Server-only module leaked to client
2. **`500 Internal Server Error`** on `/src/features/subreddits/routes/subreddits._index.tsx` - Same issue
3. **`OrgTRPC not registered`** - OrgSwitcher crashes for authenticated users
4. **`Warning: Extra attributes from the server`** on input elements - Minor SSR hydration mismatch (LOW)

## Acceptance Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Home page renders with SSR (no spinner) | PASS | SSR works, content visible immediately |
| Communities page loads | PASS | SSR renders correctly |
| Sign-in CTA visible when logged out | PASS | Multiple Sign In / Get Started links visible |
| 404 for nonexistent communities | PASS | Returns HTTP 404 |
| Sort tabs work | FAIL | React hydration broken (Issue 1) |
| Create community flow | FAIL | Auth broken (Issue 2) |
| Join/Leave community | FAIL | Hydration broken + no data |
| Create post | FAIL | Auth broken (Issue 2) |
| Vote on post | FAIL | Blocked by above |
| Comment on post | FAIL | Blocked by above |
| Moderator tools | FAIL | Blocked by above |

## Recommendations

### Must Fix (CRITICAL)

1. **Remove `import '@/setup.server'` from route component files.** Move the import inside the `loader` function body, or restructure so server-only code is in `.server.ts` files that React Router can properly strip. Affected files:
   - `src/routes/index.tsx`
   - `src/features/subreddits/routes/subreddits._index.tsx`
   - `src/features/subreddits/routes/subreddits.$name.tsx`

2. **Add `registerOrgTRPC(trpc)` call during app setup.** Import `registerOrgTRPC` from `@cruzjs/start/orgs` and call it in `src/trpc/client.ts` after creating the trpc hooks. Without this, the `OrgSwitcher` in the navbar crashes for logged-in users.

### Should Fix (HIGH)

3. **Seed the database** with at least one test user (matching `admin@example.com` / `test-password` from config) and a few sample communities/posts so the app has data to display and test.

4. **Verify login flow works end-to-end** after fixing Issues 1 and 2. The login API call appears to return 500 which may be related to the missing OrgTRPC registration.

### Nice to Have (LOW)

5. **Fix SSR hydration warning** on auth form inputs (`Warning: Extra attributes from the server: style`). This is a Chakra UI SSR mismatch.
