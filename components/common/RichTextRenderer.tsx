'use client'

import React from 'react'
import { ProjectDescription } from '@/lib/types/database'
import { projectDescriptionToHtml, hasContent, extractPlainText } from '@/lib/utils/content-migration'
import { cn } from '@/lib/utils'

interface RichTextRendererProps {
  /** Project description object or HTML string */
  content?: ProjectDescription | string | null
  /** Additional CSS classes */
  className?: string
  /** Fallback content if no content is provided */
  fallback?: React.ReactNode
  /** Whether to show fallback for empty content */
  showFallbackOnEmpty?: boolean
  /** Custom prose styling */
  prose?: boolean
}

/**
 * RichTextRenderer - Safely renders rich text content from ProjectDescription
 * 
 * This component handles both legacy string descriptions and new ProjectDescription objects,
 * sanitizes HTML content, and provides consistent styling for rich text display.
 */
export default function RichTextRenderer({
  content,
  className,
  fallback = null,
  showFallbackOnEmpty = true,
  prose = true
}: RichTextRendererProps) {
  
  // Handle different content types
  const getHtmlContent = (): string => {
    if (!content) return ''
    
    // Handle ProjectDescription object
    if (typeof content === 'object' && content.content) {
      return projectDescriptionToHtml(content)
    }
    
    // Handle legacy string content
    if (typeof content === 'string') {
      return content
    }
    
    return ''
  }
  
  const htmlContent = getHtmlContent()
  
  // Check if content is empty or just whitespace/empty tags
  const isEmpty = !htmlContent || !htmlContent.trim() || 
    htmlContent.replace(/<[^>]*>/g, '').trim() === ''
  
  // Show fallback if content is empty and fallback is enabled
  if (isEmpty && showFallbackOnEmpty && fallback) {
    return <>{fallback}</>
  }
  
  // Don't render anything if empty and no fallback
  if (isEmpty) {
    return null
  }
  
  return (
    <div 
      className={cn(
        // Base styling
        'rich-text-content',
        // Custom list styling for consistency with editor
        '[&_.bullet-list]:list-disc [&_.bullet-list]:pl-6 [&_.bullet-list]:my-2',
        '[&_.ordered-list]:list-decimal [&_.ordered-list]:pl-6 [&_.ordered-list]:my-2',
        '[&_.list-item]:my-1 [&_.list-item]:text-dark-grey',
        // Prose styling for better typography
        prose && [
          'prose prose-gray max-w-none',
          'prose-headings:font-financier prose-headings:text-dark-grey',
          'prose-p:text-dark-grey prose-p:leading-relaxed prose-p:mb-6',
          'prose-strong:text-dark-grey prose-strong:font-semibold',
          'prose-em:text-dark-grey',
          'prose-a:text-[var(--cbre-green)] prose-a:no-underline hover:prose-a:underline',
          'prose-blockquote:border-l-[var(--cbre-green)] prose-blockquote:text-dark-grey',
          'prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic',
          'prose-ul:text-dark-grey prose-ol:text-dark-grey',
          'prose-li:text-dark-grey prose-li:leading-relaxed',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-ul:pl-6 prose-ol:pl-6',
          'prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8 first:prose-h1:mt-0',
          'prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6 first:prose-h2:mt-0',
          'prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4 first:prose-h3:mt-0'
        ],
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

/**
 * RichTextPreview - Renders truncated plain text preview
 */
export function RichTextPreview({ 
  content, 
  maxLength = 150,
  className 
}: { 
  content?: ProjectDescription | string | null
  maxLength?: number
  className?: string
}) {
  const plainText = typeof content === 'object' 
    ? extractPlainText(content)
    : typeof content === 'string'
    ? content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : ''
  
  if (!plainText) return null
  
  const truncated = plainText.length > maxLength 
    ? plainText.substring(0, maxLength).trim() + '...'
    : plainText
  
  return (
    <p className={cn('text-gray-600 text-sm', className)}>
      {truncated}
    </p>
  )
}

/**
 * Helper hook for working with rich text content
 */
export function useRichTextContent(content?: ProjectDescription | string | null) {
  const hasContentValue = React.useMemo(() => {
    if (!content) return false
    
    if (typeof content === 'object') {
      return hasContent(content)
    }
    
    if (typeof content === 'string') {
      const textContent = content.replace(/<[^>]*>/g, '').trim()
      return textContent.length > 0
    }
    
    return false
  }, [content])
  
  const plainText = React.useMemo(() => {
    if (typeof content === 'object') {
      return extractPlainText(content)
    }
    
    if (typeof content === 'string') {
      return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    }
    
    return ''
  }, [content])
  
  const wordCount = React.useMemo(() => {
    if (!plainText) return 0
    return plainText.split(/\s+/).filter(word => word.length > 0).length
  }, [plainText])
  
  return {
    hasContent: hasContentValue,
    plainText,
    wordCount
  }
} 