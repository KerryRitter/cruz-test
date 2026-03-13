# User Flows: Posts Feature

## Flow 1: Create a Post

1. Log in and navigate to a subreddit page at `/r/{name}`
2. Join the subreddit if not already a member (click "Join")
3. Click the "New Post" button (only visible to logged-in members)
4. Fill in the title (required, 1-300 chars) and optional body text (up to 40000 chars)
5. Click "Post"
6. On success, you are redirected to the post detail page at `/r/{name}/comments/{id}`
7. On failure (not a member, validation error), an error message is shown

## Flow 2: View Posts in a Subreddit

1. Navigate to `/r/{name}`
2. The subreddit header shows community info, member count, and join/leave buttons
3. Below the header, sort tabs let you switch between "New" (default, by date) and "Top" (by score)
4. Posts are listed as cards showing: score, title, author (truncated ID), time ago, and comment count
5. Click any post card to navigate to its detail page
6. If no posts exist, a "No posts yet" placeholder is shown

## Flow 3: View Post Detail

1. Navigate to `/r/{name}/comments/{id}` (or click a post card)
2. A back link returns to the subreddit page
3. Post displays: author (truncated userId), time ago, title, body text, score, and comment count
4. A "Comments" section shows "Comments coming soon" placeholder

## Testing Checklist

- [ ] Authenticated user can create a post in a subreddit they belong to
- [ ] Non-member gets an error when trying to create a post
- [ ] Unauthenticated users do not see the "New Post" button
- [ ] Posts list shows in correct sort order (New vs Top)
- [ ] Post detail page loads correctly and displays all fields
- [ ] Non-existent post shows "Post not found" error
- [ ] Form validation prevents empty titles and overly long content
