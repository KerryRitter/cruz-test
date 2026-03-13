# QA Results #2

## Verdict: NEEDS_WORK

## Summary
- Total Tests: 6
- Passed: 3
- Failed: 3

## Test Results

### Passed Tests
1. **Login page (/auth/login)** - Renders correctly with Email, Password fields, "Remember me" checkbox, "Forgot password?" link, Login button, and "Register" link. Navigation bar shows "Log in" and "Get Started" buttons.
2. **Register page (/auth/register)** - Renders correctly with Name, Email, Password, Confirm Password, and Invite Code fields. Has "Terms and Conditions" checkbox and Register button. Navigation links work.
3. **Create Community page (/subreddits/create)** - Form renders with Community Name (prefixed "r/"), Display Title, Description (optional, 0/500 counter), and Cancel button. Layout and validation hints display properly.

### Failed Tests
1. **Home page (/)**
   - Steps to reproduce:
     1. Navigate to http://localhost:5001/
   - Expected: Page loads with posts feed or empty state message
   - Actual: Page renders layout (heading "Home", "Top" sort button, "Sign in to personalize..." banner, QUICK LINKS sidebar with "Browse Communities") but shows perpetual "Loading posts..." spinner that never resolves
   - Severity: CRITICAL
   - Screenshot: 01-home.png, 01-home-5s.png
   - Root cause: D1 database table "Posts" does not exist. Server log: `tRPC failed on posts.feed: D1_ERROR: no such table: Posts: SQLITE_ERROR`

2. **Communities discovery page (/subreddits)**
   - Steps to reproduce:
     1. Navigate to http://localhost:5001/subreddits
   - Expected: Page loads with list of communities or empty state
   - Actual: Shows only "Loading communities..." text that never resolves. No page header, no layout chrome visible.
   - Severity: CRITICAL
   - Screenshot: 02-communities.png, 02-communities-5s.png
   - Root cause: D1 database table "Subreddits" does not exist. Server log: `tRPC failed on subreddits.list: D1_ERROR: no such table: Subreddits: SQLITE_ERROR`

3. **Login page at /login (config mismatch)**
   - Steps to reproduce:
     1. Navigate to http://localhost:5001/login
   - Expected: Login page renders
   - Actual: 404 page - "The requested page could not be found."
   - Severity: MEDIUM
   - Screenshot: 04-login.png (first version, before corrected path)
   - Notes: The config.md file at `.claude/agents/shared/config.md` lists `login_path: /login` but the actual login route is `/auth/login`. This is a documentation/config mismatch that could cause agent automation failures.

## Edge Cases Tested

| Case | Result | Notes |
|------|--------|-------|
| Missing DB tables | FAIL | Both Posts and Subreddits tables missing from D1 |
| Loading states | FAIL | Spinners never resolve; no timeout or error fallback shown to user |
| 404 handling | PASS | Clean 404 page renders for unknown routes |
| Unauthenticated access | PASS | Home page shows appropriate "Sign in to personalize" banner |
| Create community (unauthed) | PASS | Form renders; submit behavior not testable without auth + DB |

## Console / Server Errors

From `.cruz/dev-server.log`:
- **10 occurrences** of `no such table` errors across `Posts` and `Subreddits` tables
- `HTTP 500` responses from tRPC loaders for `subreddits.list`, `subreddits.mySubscriptions`, `posts.feed`
- `No route matches URL "/login"` -- confirms the /login path does not exist
- Multiple instances of `[DEBUG] Building container with 7 user providers` (not an error, just noise)

## Acceptance Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Home page loads and shows posts | FAIL | Stuck on "Loading posts..." due to missing DB tables |
| Communities page lists communities | FAIL | Stuck on "Loading communities..." due to missing DB tables |
| Create community form renders | PASS | Form displays correctly at /subreddits/create |
| Auth pages render | PASS | Login at /auth/login and Register at /auth/register both render |
| No unhandled runtime crashes | FAIL | tRPC 500 errors on every data-loading page |

## Recommendations

1. **CRITICAL - Run database migrations**: The D1 database is missing required tables (Posts, Subreddits, and likely others). Run `cruz db migrate` (or `cruz db hard-reset` followed by `cruz db migrate`) to create the schema.
2. **CRITICAL - Add error fallback UI**: When tRPC queries fail (500), the UI shows a perpetual loading spinner with no error message or retry option. The loading states for posts and communities should handle errors gracefully and display a user-friendly message.
3. **MEDIUM - Fix config.md login_path**: Update `.claude/agents/shared/config.md` to use `login_path: /auth/login` instead of `/login`.
4. **LOW - Communities page missing layout**: The /subreddits page appears to have no page header or navigation when loading -- compare with the home page which still shows its layout structure even while loading.
