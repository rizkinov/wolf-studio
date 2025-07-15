// Cypress Configuration for Wolf Studio E2E Testing
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // Base URL for the application
    baseUrl: 'http://localhost:3000',
    
    // Test files
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    
    // Support file
    supportFile: 'cypress/support/e2e.ts',
    
    // Fixtures folder
    fixturesFolder: 'cypress/fixtures',
    
    // Screenshots folder
    screenshotsFolder: 'cypress/screenshots',
    
    // Videos folder
    videosFolder: 'cypress/videos',
    
    // Test settings
    testIsolation: true,
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Video recording
    video: true,
    videoCompression: 32,
    
    // Screenshots
    screenshotOnRunFailure: true,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    taskTimeout: 60000,
    
    // Retry settings
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Browser settings
    chromeWebSecurity: false,
    
    // Wait settings
    waitForAnimations: true,
    animationDistanceThreshold: 5,
    
    // Scrolling
    scrollBehavior: 'center',
    
    // Test runner settings
    watchForFileChanges: true,
    
    // Node event listeners
    setupNodeEvents(on, config) {
      // Custom tasks
      on('task', {
        // Log messages
        log(message: string) {
          console.log(message)
          return null
        },
        
        // Clear database
        clearDatabase() {
          // Implementation would go here
          return null
        },
        
        // Seed database
        seedDatabase() {
          // Implementation would go here
          return null
        },
        
        // Generate test data
        generateTestData() {
          return {
            users: [
              {
                id: 'test-user-1',
                email: 'admin@wolfstudio.com',
                role: 'admin',
                firstName: 'Admin',
                lastName: 'User',
              },
            ],
            projects: [
              {
                id: 'test-project-1',
                title: 'Test Project',
                slug: 'test-project',
                description: 'Test project description',
                isPublished: true,
              },
            ],
          }
        },
        
        // Environment specific tasks
        getEnvironment() {
          return {
            NODE_ENV: process.env.NODE_ENV || 'test',
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            baseUrl: config.baseUrl,
            viewportWidth: config.viewportWidth,
            viewportHeight: config.viewportHeight,
          }
        },
      })
      
      // Browser configuration
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--disable-gpu')
          launchOptions.args.push('--no-sandbox')
        }
        
        if (browser.name === 'electron') {
          launchOptions.preferences.width = 1280
          launchOptions.preferences.height = 720
        }
        
        return launchOptions
      })
      
      // Environment variables
      config.env = {
        ...config.env,
        NODE_ENV: process.env.NODE_ENV || 'test',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'test-secret-key-min-32-chars-long',
        // Test user credentials
        TEST_ADMIN_EMAIL: 'admin@wolfstudio.com',
        TEST_ADMIN_PASSWORD: 'TestPassword123!',
        TEST_EDITOR_EMAIL: 'editor@wolfstudio.com',
        TEST_EDITOR_PASSWORD: 'TestPassword123!',
        TEST_VIEWER_EMAIL: 'viewer@wolfstudio.com',
        TEST_VIEWER_PASSWORD: 'TestPassword123!',
      }
      
      return config
    },
    
    // Environment variables
    env: {
      coverage: true,
      codeCoverage: {
        url: 'http://localhost:3000/__coverage__',
      },
    },
    
    // Experimental features
    experimentalStudio: true,
    experimentalWebKitSupport: true,
  },
  
  // Component testing configuration
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
  
  // Global configuration
  userAgent: 'Wolf Studio Cypress Test Agent',
  
  // Networking
  blockHosts: ['*.google-analytics.com', '*.googletagmanager.com'],
  
  // Security
  modifyObstructiveCode: false,
  
  // Debugging
  numTestsKeptInMemory: 50,
  
  // Project ID for Cypress Dashboard
  projectId: 'wolf-studio-test',
  
  // Custom configuration
  includeShadowDom: true,
  
  // Logs
  trashAssetsBeforeRuns: true,
  
  // File server
  fileServerFolder: 'cypress',
}) 