// Lighthouse CI Configuration for Wolf Studio Performance Testing
module.exports = {
  ci: {
    // Build configuration
    build: {
      command: 'npm run build',
      outputDir: '.next',
    },
    
    // Collection configuration
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000',
        'http://localhost:3000/wolf-studio',
        'http://localhost:3000/wolf-studio/our-work',
        'http://localhost:3000/admin',
        'http://localhost:3000/admin/projects',
        'http://localhost:3000/admin/categories',
        'http://localhost:3000/admin/users',
        'http://localhost:3000/admin/analytics',
        'http://localhost:3000/admin/settings',
      ],
      
      // Number of runs per URL
      numberOfRuns: 3,
      
      // Lighthouse settings
      settings: {
        // Enable all categories
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        
        // Chrome flags
        chromeFlags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--headless',
        ],
        
        // Emulation settings
        emulatedFormFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        
        // Audit settings
        skipAudits: [
          'uses-http2',
          'uses-long-cache-ttl',
          'uses-text-compression',
        ],
        
        // Budget settings
        budgets: [
          {
            path: '/*',
            resourceSizes: [
              {
                resourceType: 'total',
                budget: 2000,
              },
              {
                resourceType: 'script',
                budget: 600,
              },
              {
                resourceType: 'image',
                budget: 800,
              },
              {
                resourceType: 'stylesheet',
                budget: 200,
              },
              {
                resourceType: 'font',
                budget: 200,
              },
            ],
            resourceCounts: [
              {
                resourceType: 'total',
                budget: 100,
              },
              {
                resourceType: 'script',
                budget: 20,
              },
              {
                resourceType: 'image',
                budget: 30,
              },
              {
                resourceType: 'stylesheet',
                budget: 10,
              },
              {
                resourceType: 'font',
                budget: 5,
              },
            ],
            timings: [
              {
                metric: 'first-contentful-paint',
                budget: 2000,
              },
              {
                metric: 'largest-contentful-paint',
                budget: 2500,
              },
              {
                metric: 'first-meaningful-paint',
                budget: 2000,
              },
              {
                metric: 'speed-index',
                budget: 3000,
              },
              {
                metric: 'interactive',
                budget: 3000,
              },
            ],
          },
        ],
      },
      
      // Server configuration
      startServerCommand: 'npm start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,
    },
    
    // Assertions configuration
    assert: {
      assertions: {
        // Performance assertions
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.85 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['error', { maxNumericValue: 2000 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Resource assertions
        'resource-summary:script:size': ['error', { maxNumericValue: 600000 }],
        'resource-summary:image:size': ['error', { maxNumericValue: 800000 }],
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 200000 }],
        'resource-summary:font:size': ['error', { maxNumericValue: 200000 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 2000000 }],
        
        // Accessibility assertions
        'color-contrast': 'error',
        'image-alt': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'meta-description': 'error',
        
        // Best practices assertions
        'uses-https': 'error',
        'no-vulnerable-libraries': 'error',
        'external-anchors-use-rel-noopener': 'error',
        'geolocation-on-start': 'error',
        'notification-on-start': 'error',
        
        // SEO assertions
        'meta-description': 'error',
        'document-title': 'error',
        'crawlable-anchors': 'error',
        'is-crawlable': 'error',
        'robots-txt': 'error',
        'hreflang': 'error',
        'canonical': 'error',
        
        // Performance budget assertions
        'performance-budget': 'error',
        'timing-budget': 'error',
      },
    },
    
    // Upload configuration
    upload: {
      target: 'temporary-public-storage',
      token: process.env.LHCI_TOKEN,
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
      serverBaseUrl: process.env.LHCI_SERVER_BASE_URL,
      
      // Report configuration
      reportFilenamePattern: 'lighthouse-report-%%PATHNAME%%-%%DATETIME%%.%%EXTENSION%%',
      
      // Basic auth if needed
      basicAuth: {
        username: process.env.LHCI_BASIC_AUTH_USERNAME,
        password: process.env.LHCI_BASIC_AUTH_PASSWORD,
      },
    },
    
    // Wizard configuration
    wizard: {
      // Skip wizard in CI
      skipWizard: !!process.env.CI,
    },
    
    // Server configuration (for self-hosted LHCI server)
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci.db',
      },
    },
  },
  
  // Environment-specific configurations
  ...(process.env.NODE_ENV === 'production' && {
    ci: {
      collect: {
        url: [
          'https://wolf-studio.vercel.app',
          'https://wolf-studio.vercel.app/wolf-studio',
          'https://wolf-studio.vercel.app/wolf-studio/our-work',
        ],
        settings: {
          chromeFlags: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
          ],
        },
      },
    },
  }),
  
  // Development configuration
  ...(process.env.NODE_ENV === 'development' && {
    ci: {
      assert: {
        assertions: {
          // Relaxed assertions for development
          'categories:performance': ['warn', { minScore: 0.7 }],
          'categories:accessibility': ['warn', { minScore: 0.85 }],
          'categories:best-practices': ['warn', { minScore: 0.8 }],
          'categories:seo': ['warn', { minScore: 0.8 }],
        },
      },
    },
  }),
} 