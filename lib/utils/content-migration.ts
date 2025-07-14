import { ProjectDescription } from '@/lib/types/database'

/**
 * Content migration utilities for converting between different content formats
 */

/**
 * Convert raw HTML string to ProjectDescription format
 */
export function htmlToProjectDescription(
  html: string, 
  format: 'html' | 'markdown' | 'text' = 'html'
): ProjectDescription {
  // Clean up the HTML content
  const cleanedHtml = cleanHtmlContent(html)
  
  return {
    content: cleanedHtml,
    format,
    meta: {
      migratedAt: new Date().toISOString(),
      originalLength: html.length,
      cleanedLength: cleanedHtml.length
    }
  }
}

/**
 * Convert plain text to ProjectDescription format
 */
export function textToProjectDescription(
  text: string,
  preserveLineBreaks: boolean = true
): ProjectDescription {
  let content = text
  
  if (preserveLineBreaks) {
    // Convert line breaks to paragraphs
    content = text
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('')
  } else {
    content = `<p>${text.replace(/\n/g, ' ').trim()}</p>`
  }
  
  return {
    content,
    format: 'html',
    meta: {
      convertedFrom: 'text',
      originalLength: text.length,
      preservedLineBreaks: preserveLineBreaks,
      convertedAt: new Date().toISOString()
    }
  }
}

/**
 * Migrate array of paragraph strings to rich text format
 */
export function paragraphsToProjectDescription(paragraphs: string[]): ProjectDescription {
  const content = paragraphs
    .filter(p => p.trim().length > 0)
    .map(p => `<p>${p.trim()}</p>`)
    .join('')
  
  return {
    content,
    format: 'html',
    meta: {
      convertedFrom: 'paragraphs',
      originalParagraphCount: paragraphs.length,
      convertedAt: new Date().toISOString()
    }
  }
}

/**
 * Clean and standardize HTML content
 */
function cleanHtmlContent(html: string): string {
  if (!html || html.trim() === '') {
    return '<p></p>'
  }
  
  let cleaned = html.trim()
  
  // Remove potentially dangerous scripts and styles
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  
  // Normalize common HTML elements
  cleaned = cleaned.replace(/<div>/gi, '<p>')
  cleaned = cleaned.replace(/<\/div>/gi, '</p>')
  
  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '')
  
  // Ensure content is wrapped in paragraphs if it's just text
  if (!cleaned.includes('<p>') && !cleaned.includes('<h1>') && !cleaned.includes('<h2>') && !cleaned.includes('<h3>')) {
    cleaned = `<p>${cleaned}</p>`
  }
  
  // Fix multiple consecutive spaces
  cleaned = cleaned.replace(/\s+/g, ' ')
  
  return cleaned
}

/**
 * Convert ProjectDescription back to simple HTML string
 */
export function projectDescriptionToHtml(description: ProjectDescription | null): string {
  if (!description || !description.content) {
    return ''
  }
  
  return description.content
}

/**
 * Check if ProjectDescription contains meaningful content
 */
export function hasContent(description: ProjectDescription | null): boolean {
  if (!description || !description.content) {
    return false
  }
  
  const textContent = description.content.replace(/<[^>]*>/g, '').trim()
  return textContent.length > 0
}

/**
 * Extract plain text from ProjectDescription for search/preview
 */
export function extractPlainText(description: ProjectDescription | null): string {
  if (!description || !description.content) {
    return ''
  }
  
  return description.content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Get word count from ProjectDescription
 */
export function getWordCount(description: ProjectDescription | null): number {
  const text = extractPlainText(description)
  if (!text) return 0
  
  return text.split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Truncate ProjectDescription content for previews
 */
export function truncateContent(
  description: ProjectDescription | null, 
  maxLength: number = 150
): string {
  const text = extractPlainText(description)
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Batch migration function for updating multiple projects
 */
export async function migrateProjectDescriptions(
  projects: Array<{
    id: string
    description?: string | ProjectDescription | null
    [key: string]: any
  }>,
  options: {
    format?: 'html' | 'markdown' | 'text'
    preserveExisting?: boolean
  } = {}
): Promise<Array<{
  id: string
  description: ProjectDescription
  migrated: boolean
}>> {
  const { format = 'html', preserveExisting = true } = options
  
  return projects.map(project => {
    // Skip if already has proper ProjectDescription and preserveExisting is true
    if (preserveExisting && 
        project.description && 
        typeof project.description === 'object' && 
        project.description.content) {
      return {
        id: project.id,
        description: project.description as ProjectDescription,
        migrated: false
      }
    }
    
    // Handle string descriptions
    if (typeof project.description === 'string') {
      return {
        id: project.id,
        description: htmlToProjectDescription(project.description, format),
        migrated: true
      }
    }
    
    // Handle null/undefined descriptions
    return {
      id: project.id,
      description: htmlToProjectDescription('', format),
      migrated: true
    }
  })
} 