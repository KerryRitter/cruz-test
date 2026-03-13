---
name: Use playwright-cli not playwright directly
description: For browser testing, use npx playwright-cli not npx playwright
type: feedback
---

Use `npx playwright-cli` for browser testing (screenshots, interactions), not `npx playwright` or `require('playwright')`.

**Why:** User corrected this explicitly — `playwright-cli` is the correct tool in this environment.

**How to apply:** When writing QA test scripts or taking screenshots, use `npx playwright-cli screenshot <url> <output>` for screenshots.
