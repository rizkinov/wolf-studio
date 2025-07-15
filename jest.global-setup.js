// Jest Global Setup for Wolf Studio Testing Framework
// This file runs once before all tests

module.exports = async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
  process.env.NEXTAUTH_SECRET = 'test-secret-key-min-32-chars-long'
  process.env.NEXT_PUBLIC_APP_NAME = 'Wolf Studio Test'
  process.env.NEXT_PUBLIC_DEBUG = 'true'
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'false'
  process.env.RATE_LIMIT_MAX = '1000'
  process.env.RATE_LIMIT_WINDOW = '900'
  
  // Initialize global test configuration
  global.testConfig = {
    timeout: 10000,
    retries: 2,
    verbose: true,
    coverage: true,
    
    // Mock data for tests
    mockData: {
      users: [
        {
          id: 'test-user-1',
          email: 'admin@wolfstudio.com',
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'test-user-2',
          email: 'editor@wolfstudio.com',
          role: 'editor',
          firstName: 'Editor',
          lastName: 'User',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'test-user-3',
          email: 'viewer@wolfstudio.com',
          role: 'viewer',
          firstName: 'Viewer',
          lastName: 'User',
          isActive: true,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      
      categories: [
        {
          id: 'test-category-1',
          name: 'Web Design',
          slug: 'web-design',
          description: 'Web design projects',
          isActive: true,
          sortOrder: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'test-category-2',
          name: 'Mobile Apps',
          slug: 'mobile-apps',
          description: 'Mobile application projects',
          isActive: true,
          sortOrder: 2,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      
      projects: [
        {
          id: 'test-project-1',
          title: 'Test Project 1',
          slug: 'test-project-1',
          description: 'This is a test project',
          shortDescription: 'Test project short description',
          categoryId: 'test-category-1',
          isPublished: true,
          isFeatured: false,
          publishedAt: '2024-01-01T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'test-project-2',
          title: 'Test Project 2',
          slug: 'test-project-2',
          description: 'This is another test project',
          shortDescription: 'Another test project short description',
          categoryId: 'test-category-2',
          isPublished: false,
          isFeatured: true,
          publishedAt: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      
      images: [
        {
          id: 'test-image-1',
          url: 'https://example.com/image1.jpg',
          alt: 'Test Image 1',
          caption: 'This is a test image',
          imageType: 'gallery',
          projectId: 'test-project-1',
          displayOrder: 1,
          fileSize: 1024000,
          mimeType: 'image/jpeg',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'test-image-2',
          url: 'https://example.com/image2.jpg',
          alt: 'Test Image 2',
          caption: 'This is another test image',
          imageType: 'banner',
          projectId: 'test-project-1',
          displayOrder: 2,
          fileSize: 2048000,
          mimeType: 'image/jpeg',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
    
    // API endpoints for testing
    apiEndpoints: {
      users: '/api/admin/users',
      categories: '/api/admin/categories',
      projects: '/api/admin/projects',
      images: '/api/admin/images',
      upload: '/api/admin/upload-image',
      auth: '/api/auth',
      storage: '/api/admin/storage',
      system: '/api/admin/system',
    },
    
    // Test utilities
    utils: {
      // Generate random test data
      generateTestId: () => `test-${Math.random().toString(36).substr(2, 9)}`,
      
      // Generate test email
      generateTestEmail: () => `test-${Math.random().toString(36).substr(2, 9)}@example.com`,
      
      // Generate test user
      generateTestUser: (overrides = {}) => ({
        id: `test-user-${Math.random().toString(36).substr(2, 9)}`,
        email: `test-${Math.random().toString(36).substr(2, 9)}@example.com`,
        role: 'viewer',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        createdAt: new Date().toISOString(),
        ...overrides,
      }),
      
      // Generate test project
      generateTestProject: (overrides = {}) => ({
        id: `test-project-${Math.random().toString(36).substr(2, 9)}`,
        title: `Test Project ${Math.random().toString(36).substr(2, 9)}`,
        slug: `test-project-${Math.random().toString(36).substr(2, 9)}`,
        description: 'This is a test project',
        shortDescription: 'Test project short description',
        categoryId: 'test-category-1',
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
      }),
      
      // Generate test category
      generateTestCategory: (overrides = {}) => ({
        id: `test-category-${Math.random().toString(36).substr(2, 9)}`,
        name: `Test Category ${Math.random().toString(36).substr(2, 9)}`,
        slug: `test-category-${Math.random().toString(36).substr(2, 9)}`,
        description: 'This is a test category',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        ...overrides,
      }),
      
      // Generate test image
      generateTestImage: (overrides = {}) => ({
        id: `test-image-${Math.random().toString(36).substr(2, 9)}`,
        url: `https://example.com/image-${Math.random().toString(36).substr(2, 9)}.jpg`,
        alt: `Test Image ${Math.random().toString(36).substr(2, 9)}`,
        caption: 'This is a test image',
        imageType: 'gallery',
        projectId: 'test-project-1',
        displayOrder: 1,
        fileSize: 1024000,
        mimeType: 'image/jpeg',
        createdAt: new Date().toISOString(),
        ...overrides,
      }),
      
      // Mock file for testing
      createMockFile: (name = 'test.jpg', size = 1024, type = 'image/jpeg') => {
        const file = new File(['mock file content'], name, { type, size })
        return file
      },
      
      // Mock form data
      createMockFormData: (data = {}) => {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value)
          } else {
            formData.append(key, JSON.stringify(value))
          }
        })
        return formData
      },
      
      // Wait for element to appear in DOM
      waitForElement: async (selector, timeout = 5000) => {
        const startTime = Date.now()
        while (Date.now() - startTime < timeout) {
          const element = document.querySelector(selector)
          if (element) {
            return element
          }
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        throw new Error(`Element with selector "${selector}" not found within ${timeout}ms`)
      },
    },
  }
  
  // Log test environment setup
  console.log('🧪 Jest Global Setup Complete')
  console.log('📊 Test Environment Configuration:')
  console.log(`   - Node Environment: ${process.env.NODE_ENV}`)
  console.log(`   - Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log(`   - Rate Limit: ${process.env.RATE_LIMIT_MAX} requests/${process.env.RATE_LIMIT_WINDOW}s`)
  console.log(`   - Test Data: ${global.testConfig.mockData.users.length} users, ${global.testConfig.mockData.projects.length} projects`)
  console.log('✅ Ready for testing!')
} 