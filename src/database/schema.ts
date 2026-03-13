// Re-export all framework tables (core, start, pro)
export * from "@cruzjs/start/database/schema";

// App-specific tables are exported from feature schemas
export * from "../features/subreddits/subreddits.schema";
export * from "../features/posts/posts.schema";
