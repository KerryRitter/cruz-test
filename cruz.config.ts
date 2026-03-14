import { defineConfig } from '@cruzjs/cli/config';

export default defineConfig({
  name: 'cruz-test',
  compatibilityDate: '2024-12-01',
  compatibilityFlags: ['nodejs_compat'],
  bindings: {
    d1: true,
    kv: true,
    ai: true,
  },
  email: {
    provider: 'mailchannels',
  },
  environments: {
    production: {
      domain: 'cruz-test.pages.dev',
      vars: {
        NODE_ENV: 'production',
        APP_URL: 'https://cruz-test.pages.dev',
      },
    },
  },
});
