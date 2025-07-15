// Playwright Configuration for Wolf Studio Integration Testing
import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['line'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Global timeout for all tests
    actionTimeout: 10 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
    
    // Expect timeout (moved to top level)
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // User agent
    userAgent: 'Wolf Studio Test Agent',
    
    // Locale
    locale: 'en-US',
    
    // Timezone
    timezoneId: 'America/New_York',
    
    // Geolocation
    geolocation: { longitude: -74.006, latitude: 40.7128 },
    
    // Permissions
    permissions: ['geolocation'],
    
    // Color scheme
    colorScheme: 'light',
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'X-Test-Environment': 'playwright',
      'X-Test-Run-Id': process.env.GITHUB_RUN_ID || 'local',
    },
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testDir: './tests/integration',
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testDir: './tests/integration',
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testDir: './tests/integration',
    },
    
    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testDir: './tests/mobile',
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testDir: './tests/mobile',
    },
    
    // Tablet browsers
    {
      name: 'Tablet Chrome',
      use: { ...devices['iPad Pro'] },
      testDir: './tests/tablet',
    },
    
    // API testing
    {
      name: 'api',
      use: {
        baseURL: 'http://localhost:3000/api',
      },
      testDir: './tests/api',
    },
    
    // Authentication tests
    {
      name: 'auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      testDir: './tests/auth',
      dependencies: ['setup'],
    },
    
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },
    
    // Cleanup project
    {
      name: 'cleanup',
      testMatch: /.*\.cleanup\.ts/,
    },
  ],
  
  // Global test timeout
  timeout: 30 * 1000,
  
  // Global setup/teardown
  globalSetup: require.resolve('./tests/global-setup'),
  globalTeardown: require.resolve('./tests/global-teardown'),
  
  // Test match patterns
  testMatch: [
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/*.e2e.ts',
  ],
  
  // Test ignore patterns
  testIgnore: [
    '**/*.unit.test.ts',
    '**/*.component.test.ts',
    '**/node_modules/**',
    '**/.next/**',
  ],
  
  // Output directory
  outputDir: 'test-results/',
  
  // Preserve output between runs
  preserveOutput: 'failures-only',
  
  // Maximum failures to stop the test run
  maxFailures: process.env.CI ? 10 : undefined,
  
  // Update snapshots
  updateSnapshots: 'missing',
  
  // Web server configuration
  webServer: {
    command: 'npm run build && npm run start',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: 'test-secret-key-min-32-chars-long',
    },
  },
  
  // Metadata
  metadata: {
    project: 'Wolf Studio',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    runId: process.env.GITHUB_RUN_ID || 'local',
    timestamp: new Date().toISOString(),
  },
  
  // Experimental features (removed invalid properties)
  
  // Expect configuration
  expect: {
    // Timeout for expect assertions
    timeout: 5 * 1000,
    
    // Screenshot comparison options
    toHaveScreenshot: {
      threshold: 0.2,
      animations: 'disabled',
    },
    
    // Visual comparison options
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },
  
  // Grep configuration
  grep: process.env.GREP ? new RegExp(process.env.GREP) : undefined,
  grepInvert: process.env.GREP_INVERT ? new RegExp(process.env.GREP_INVERT) : undefined,
  
  // Shard configuration for parallel execution
  shard: process.env.SHARD ? {
    current: parseInt(process.env.SHARD.split('/')[0]),
    total: parseInt(process.env.SHARD.split('/')[1]),
  } : undefined,
}) 