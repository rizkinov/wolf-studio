// Jest Setup File for Wolf Studio Testing Framework
// This file is configured to run before each test

import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Mock Next.js router
jest.mock('next/router', () => require('next-router-mock'))

// Mock Next.js navigation
jest.mock('next/navigation', () => require('next-router-mock'))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key-min-32-chars-long'

// Global TextEncoder/TextDecoder for Node.js environments
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.crypto
Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    getRandomValues: jest.fn().mockImplementation(array => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
      return array
    }),
    randomUUID: jest.fn().mockImplementation(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
    subtle: {
      generateKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    },
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
})

// Mock fetch
global.fetch = jest.fn()

// Mock console methods for cleaner test output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.error = (...args) => {
  // Filter out known React warnings during tests
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: validateDOMNesting'))
  ) {
    return
  }
  originalConsoleError.call(console, ...args)
}

console.warn = (...args) => {
  // Filter out known warnings during tests
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: componentWillReceiveProps') ||
     args[0].includes('Warning: componentWillMount'))
  ) {
    return
  }
  originalConsoleWarn.call(console, ...args)
}

// Mock Image for testing
global.Image = class {
  constructor() {
    setTimeout(() => {
      this.onload() // simulate success
    }, 100)
  }
}

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Array(4).fill(0),
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
})

// Mock HTMLCanvasElement toBlobURL
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock')

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.readAsDataURL = jest.fn(() => {
      this.result = 'data:image/png;base64,mock'
      setTimeout(() => this.onload(), 100)
    })
    this.readAsText = jest.fn(() => {
      this.result = 'mock text'
      setTimeout(() => this.onload(), 100)
    })
  }
}

// Mock Blob
global.Blob = class {
  constructor(chunks, options) {
    this.size = 0
    this.type = options?.type || ''
    this.chunks = chunks
  }
  
  text() {
    return Promise.resolve('mock blob text')
  }
  
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0))
  }
}

// Mock File
global.File = class extends Blob {
  constructor(chunks, name, options) {
    super(chunks, options)
    this.name = name
    this.lastModified = Date.now()
  }
}

// Mock DataTransfer for drag and drop tests
global.DataTransfer = class {
  constructor() {
    this.items = []
    this.files = []
  }
}

// Mock DragEvent
global.DragEvent = class extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict)
    this.dataTransfer = new DataTransfer()
  }
}

// Mock ClipboardEvent
global.ClipboardEvent = class extends Event {
  constructor(type, eventInitDict) {
    super(type, eventInitDict)
    this.clipboardData = new DataTransfer()
  }
}

// Global test utilities
global.testUtils = {
  // Mock Supabase client
  mockSupabaseClient: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        list: jest.fn(),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'mock-url' } })),
      })),
    },
  },
  
  // Mock API response
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  }),
  
  // Mock user session
  mockUserSession: {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'admin',
      user_metadata: {
        firstName: 'Test',
        lastName: 'User',
      },
    },
  },
  
  // Mock form data
  mockFormData: new FormData(),
  
  // Wait for async operations in tests
  waitFor: (callback, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const checkCondition = () => {
        try {
          const result = callback()
          if (result) {
            resolve(result)
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for condition'))
          } else {
            setTimeout(checkCondition, 50)
          }
        } catch (error) {
          reject(error)
        }
      }
      checkCondition()
    })
  },
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

// Clean up after each test
afterEach(() => {
  jest.restoreAllMocks()
}) 