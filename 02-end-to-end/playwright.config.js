import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    headless: true,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'PATH="/opt/homebrew/opt/node@20/bin:$PATH" npm run dev',
    url: process.env.E2E_BASE_URL || 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
