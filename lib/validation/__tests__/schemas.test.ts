// Unit Tests for Wolf Studio Validation Schemas
import {
  UserRegistrationSchema,
  UserLoginSchema,
  ProjectCreateSchema,
  CategoryCreateSchema,
  ImageUploadSchema,
  validateAndSanitizeInput,
  sanitizeHtml,
} from '../schemas'

describe('User Validation Schemas', () => {
  describe('UserRegistrationSchema', () => {
    it('should validate a valid user registration', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        termsAccepted: true,
      }

      const result = UserRegistrationSchema.safeParse(validUser)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe('viewer') // Default role
      }
    })

    it('should reject invalid email format', () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        termsAccepted: true,
      }

      const result = UserRegistrationSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format')
      }
    })

    it('should reject weak password', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        termsAccepted: true,
      }

      const result = UserRegistrationSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1)
        expect(result.error.issues[0].message).toContain('Password must be at least 8 characters')
      }
    })

    it('should reject mismatched passwords', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'DifferentPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        termsAccepted: true,
      }

      const result = UserRegistrationSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match')
      }
    })

    it('should reject if terms not accepted', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        termsAccepted: false,
      }

      const result = UserRegistrationSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('You must accept the terms and conditions')
      }
    })
  })

  describe('UserLoginSchema', () => {
    it('should validate a valid login', () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      }

      const result = UserLoginSchema.safeParse(validLogin)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.rememberMe).toBe(false) // Default value
      }
    })

    it('should accept rememberMe option', () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        rememberMe: true,
      }

      const result = UserLoginSchema.safeParse(validLogin)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.rememberMe).toBe(true)
      }
    })

    it('should reject invalid email', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'TestPassword123!',
      }

      const result = UserLoginSchema.safeParse(invalidLogin)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const invalidLogin = {
        email: 'test@example.com',
        password: '',
      }

      const result = UserLoginSchema.safeParse(invalidLogin)
      expect(result.success).toBe(false)
    })
  })
})

describe('Project Validation Schemas', () => {
  describe('ProjectCreateSchema', () => {
    it('should validate a valid project', () => {
      const validProject = {
        title: 'Test Project',
        description: 'This is a test project',
        categoryId: '12345678-1234-1234-1234-123456789012',
      }

      const result = ProjectCreateSchema.safeParse(validProject)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublished).toBe(false) // Default value
        expect(result.data.isFeatured).toBe(false) // Default value
      }
    })

    it('should reject empty title', () => {
      const invalidProject = {
        title: '',
        description: 'This is a test project',
        categoryId: '12345678-1234-1234-1234-123456789012',
      }

      const result = ProjectCreateSchema.safeParse(invalidProject)
      expect(result.success).toBe(false)
    })

    it('should reject invalid UUID for categoryId', () => {
      const invalidProject = {
        title: 'Test Project',
        description: 'This is a test project',
        categoryId: 'invalid-uuid',
      }

      const result = ProjectCreateSchema.safeParse(invalidProject)
      expect(result.success).toBe(false)
    })

    it('should reject title that is too long', () => {
      const invalidProject = {
        title: 'a'.repeat(101), // 101 characters
        description: 'This is a test project',
        categoryId: '12345678-1234-1234-1234-123456789012',
      }

      const result = ProjectCreateSchema.safeParse(invalidProject)
      expect(result.success).toBe(false)
    })

    it('should accept valid images array', () => {
      const validProject = {
        title: 'Test Project',
        description: 'This is a test project',
        categoryId: '12345678-1234-1234-1234-123456789012',
        images: [
          {
            url: 'https://example.com/image.jpg',
            alt: 'Test image',
            imageType: 'gallery' as const,
          },
        ],
      }

      const result = ProjectCreateSchema.safeParse(validProject)
      expect(result.success).toBe(true)
    })
  })
})

describe('Category Validation Schemas', () => {
  describe('CategoryCreateSchema', () => {
    it('should validate a valid category', () => {
      const validCategory = {
        name: 'Web Design',
        description: 'Web design projects',
      }

      const result = CategoryCreateSchema.safeParse(validCategory)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(true) // Default value
        expect(result.data.sortOrder).toBe(0) // Default value
      }
    })

    it('should reject empty name', () => {
      const invalidCategory = {
        name: '',
        description: 'Web design projects',
      }

      const result = CategoryCreateSchema.safeParse(invalidCategory)
      expect(result.success).toBe(false)
    })

    it('should accept valid parentId', () => {
      const validCategory = {
        name: 'Web Design',
        description: 'Web design projects',
        parentId: '12345678-1234-1234-1234-123456789012',
      }

      const result = CategoryCreateSchema.safeParse(validCategory)
      expect(result.success).toBe(true)
    })

    it('should reject invalid parentId', () => {
      const invalidCategory = {
        name: 'Web Design',
        description: 'Web design projects',
        parentId: 'invalid-uuid',
      }

      const result = CategoryCreateSchema.safeParse(invalidCategory)
      expect(result.success).toBe(false)
    })
  })
})

describe('Image Upload Validation Schemas', () => {
  describe('ImageUploadSchema', () => {
    it('should validate a valid image upload', () => {
      const validImageUpload = {
        file: {
          name: 'test.jpg',
          size: 1024000,
          type: 'image/jpeg',
        },
        alt: 'Test image',
        imageType: 'gallery' as const,
      }

      const result = ImageUploadSchema.safeParse(validImageUpload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.imageType).toBe('gallery')
      }
    })

    it('should reject file that is too large', () => {
      const invalidImageUpload = {
        file: {
          name: 'test.jpg',
          size: 11 * 1024 * 1024, // 11MB
          type: 'image/jpeg',
        },
        alt: 'Test image',
        imageType: 'gallery' as const,
      }

      const result = ImageUploadSchema.safeParse(invalidImageUpload)
      expect(result.success).toBe(false)
    })

    it('should reject invalid image type', () => {
      const invalidImageUpload = {
        file: {
          name: 'test.txt',
          size: 1024,
          type: 'text/plain',
        },
        alt: 'Test image',
        imageType: 'gallery' as const,
      }

      const result = ImageUploadSchema.safeParse(invalidImageUpload)
      expect(result.success).toBe(false)
    })

    it('should reject empty alt text', () => {
      const invalidImageUpload = {
        file: {
          name: 'test.jpg',
          size: 1024000,
          type: 'image/jpeg',
        },
        alt: '',
        imageType: 'gallery' as const,
      }

      const result = ImageUploadSchema.safeParse(invalidImageUpload)
      expect(result.success).toBe(false)
    })
  })
})

describe('HTML Sanitization', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const maliciousHtml = '<div>Safe content</div><script>alert("xss")</script>'
      const result = sanitizeHtml(maliciousHtml)
      expect(result).toBe('<div>Safe content</div>')
    })

    it('should remove iframe tags', () => {
      const maliciousHtml = '<div>Safe content</div><iframe src="malicious.com"></iframe>'
      const result = sanitizeHtml(maliciousHtml)
      expect(result).toBe('<div>Safe content</div>')
    })

    it('should remove javascript protocols', () => {
      const maliciousHtml = '<a href="javascript:alert(1)">Click me</a>'
      const result = sanitizeHtml(maliciousHtml)
      expect(result).toBe('<a href="">Click me</a>')
    })

    it('should remove event handlers', () => {
      const maliciousHtml = '<div onclick="alert(1)">Click me</div>'
      const result = sanitizeHtml(maliciousHtml)
      expect(result).toBe('<div>Click me</div>')
    })

    it('should preserve safe HTML', () => {
      const safeHtml = '<div><p>Safe <strong>content</strong></p></div>'
      const result = sanitizeHtml(safeHtml)
      expect(result).toBe(safeHtml)
    })
  })
})

describe('Validation and Sanitization Helper', () => {
  describe('validateAndSanitizeInput', () => {
    it('should validate and sanitize valid input', () => {
      const validInput = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        rememberMe: false,
      }

      const result = validateAndSanitizeInput(UserLoginSchema, validInput)
      expect(result).toEqual(validInput)
    })

    it('should throw error for invalid input', () => {
      const invalidInput = {
        email: 'invalid-email',
        password: 'TestPassword123!',
      }

      expect(() => {
        validateAndSanitizeInput(UserLoginSchema, invalidInput)
      }).toThrow('Validation failed')
    })

    it('should sanitize string fields', () => {
      const inputWithHtml = {
        title: '<script>alert("xss")</script>Test Project',
        description: '<div>Safe content</div>',
        categoryId: '12345678-1234-1234-1234-123456789012',
      }

      const result = validateAndSanitizeInput(ProjectCreateSchema, inputWithHtml)
      expect(result.title).toBe('Test Project')
      expect(result.description).toBe('<div>Safe content</div>')
    })
  })
})

describe('Edge Cases and Error Handling', () => {
  it('should handle null and undefined values', () => {
    const result = UserLoginSchema.safeParse(null)
    expect(result.success).toBe(false)
  })

  it('should handle empty objects', () => {
    const result = UserLoginSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should handle nested validation errors', () => {
    const invalidProject = {
      title: 'Test Project',
      categoryId: '12345678-1234-1234-1234-123456789012',
      images: [
        {
          url: 'invalid-url',
          alt: '',
          imageType: 'invalid-type',
        },
      ],
    }

    const result = ProjectCreateSchema.safeParse(invalidProject)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0)
    }
  })
})

describe('Performance and Memory', () => {
  it('should handle large arrays efficiently', () => {
    const largeProject = {
      title: 'Test Project',
      categoryId: '12345678-1234-1234-1234-123456789012',
      tags: Array(5).fill('tag'), // 5 tags (within limit)
    }

    const result = ProjectCreateSchema.safeParse(largeProject)
    expect(result.success).toBe(true)
  })

  it('should reject arrays that exceed limits', () => {
    const largeProject = {
      title: 'Test Project',
      categoryId: '12345678-1234-1234-1234-123456789012',
      tags: Array(11).fill('tag'), // 11 tags (exceeds limit of 10)
    }

    const result = ProjectCreateSchema.safeParse(largeProject)
    expect(result.success).toBe(false)
  })
})

describe('Security Validations', () => {
  it('should validate strong password requirements', () => {
    const passwords = [
      { password: 'weak', valid: false },
      { password: 'WeakPassword', valid: false }, // No number or special char
      { password: 'weakpassword123', valid: false }, // No uppercase or special char
      { password: 'WeakPassword123', valid: false }, // No special char
      { password: 'WeakPassword123!', valid: true }, // Valid strong password
    ]

    passwords.forEach(({ password, valid }) => {
      const result = UserRegistrationSchema.safeParse({
        email: 'test@example.com',
        password,
        confirmPassword: password,
        firstName: 'John',
        lastName: 'Doe',
        termsAccepted: true,
      })
      expect(result.success).toBe(valid)
    })
  })

  it('should validate email format strictly', () => {
    const emails = [
      { email: 'test@example.com', valid: true },
      { email: 'test.email+tag@example.com', valid: true },
      { email: 'test@example.co.uk', valid: true },
      { email: 'invalid-email', valid: false },
      { email: '@example.com', valid: false },
      { email: 'test@', valid: false },
      { email: 'test@.com', valid: false },
    ]

    emails.forEach(({ email, valid }) => {
      const result = UserLoginSchema.safeParse({
        email,
        password: 'TestPassword123!',
      })
      expect(result.success).toBe(valid)
    })
  })
}) 