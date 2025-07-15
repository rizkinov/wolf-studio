'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import CharacterCount from '@tiptap/extension-character-count'
import { 
  Bold, 
  Italic, 
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Eye,
  Edit3,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CBREButton } from '@/components/cbre/cbre-button'
import RichTextRenderer from '@/components/common/RichTextRenderer'

interface RichTextEditorProps {
  /** Current content as HTML string */
  content?: string
  /** Callback when content changes */
  onChange?: (content: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Whether the editor is disabled */
  disabled?: boolean
  /** Custom className */
  className?: string
  /** Whether to show the toolbar */
  showToolbar?: boolean
  /** Minimum height for the editor */
  minHeight?: string
  /** Whether to show preview toggle */
  showPreview?: boolean
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'p-2 rounded-md transition-colors flex items-center justify-center min-w-[32px] min-h-[32px]',
      'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
      isActive 
        ? 'bg-[var(--cbre-green)] text-white hover:bg-[var(--cbre-green)]/90 shadow-sm' 
        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
    )}
    style={isActive ? { color: 'white !important' } : {}}
  >
    {children}
  </button>
)

const ToolbarSeparator: React.FC = () => (
  <div className="w-px h-6 bg-gray-300 mx-1" />
)

// Custom Link Modal Component
interface LinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (url: string, text?: string) => void
  initialUrl?: string
  initialText?: string
}

const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialUrl = '',
  initialText = ''
}) => {
  const [url, setUrl] = React.useState(initialUrl)
  const [linkText, setLinkText] = React.useState(initialText)

  React.useEffect(() => {
    setUrl(initialUrl)
    setLinkText(initialText)
  }, [initialUrl, initialText, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onSubmit(url.trim(), linkText.trim())
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-financier text-[var(--cbre-green)]">Add Link</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-grey mb-2">
              URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cbre-green)] focus:border-transparent"
              placeholder="https://example.com"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && url.trim()) {
                  handleSubmit(e)
                }
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-grey mb-2">
              Link Text (optional)
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--cbre-green)] focus:border-transparent"
              placeholder="Link text"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && url.trim()) {
                  handleSubmit(e)
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use selected text
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <CBREButton
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </CBREButton>
            <CBREButton
              type="button"
              disabled={!url.trim()}
              onClick={handleSubmit}
            >
              Add Link
            </CBREButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  disabled = false,
  className,
  showToolbar = true,
  minHeight = '200px',
  showPreview = true
}: RichTextEditorProps) {
  
  const [isPreviewMode, setIsPreviewMode] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [linkModalOpen, setLinkModalOpen] = React.useState(false)
  
  // Handle client-side mounting to avoid SSR issues
  React.useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'ordered-list',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'list-item',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[var(--cbre-green)] hover:underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextStyle.configure(),
      Color.configure({
        types: ['textStyle'],
      }),
      CharacterCount.configure(),
    ],
    content,
    editable: !disabled && !isPreviewMode,
    immediatelyRender: false, // Fix SSR hydration issues
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
  }, [disabled, isPreviewMode, placeholder])

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled && !isPreviewMode)
    }
  }, [editor, disabled, isPreviewMode])

  const handleAddLink = React.useCallback((url: string, linkText?: string) => {
    if (!editor) return
    
    // If we have selected text or if linkText is provided
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)
    
    if (selectedText || linkText) {
      // Replace selected text or insert new text with link
      const textToUse = linkText || selectedText
      editor.chain().focus()
        .insertContent(`<a href="${url}" class="text-[var(--cbre-green)] hover:underline cursor-pointer">${textToUse}</a>`)
        .run()
    } else {
      // Just insert the URL as both text and link
      editor.chain().focus()
        .insertContent(`<a href="${url}" class="text-[var(--cbre-green)] hover:underline cursor-pointer">${url}</a>`)
        .run()
    }
  }, [editor])

  const openLinkModal = React.useCallback(() => {
    setLinkModalOpen(true)
  }, [])

  const removeLink = React.useCallback(() => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run()
  }, [editor])

  const togglePreview = React.useCallback(() => {
    setIsPreviewMode(prev => !prev)
  }, [])

  // Show loading state during SSR and initial hydration
  if (!isMounted) {
    return (
      <div className={cn('border border-gray-300 rounded-lg overflow-hidden', className)}>
        <div className="p-4 text-gray-500 text-center" style={{ minHeight }}>
          Loading editor...
        </div>
      </div>
    )
  }

  if (!editor) {
    return (
      <div className={cn('border border-gray-300 rounded-lg overflow-hidden', className)}>
        <div className="p-4 text-gray-500 text-center" style={{ minHeight }}>
          Initializing editor...
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={cn('border border-gray-300 rounded-lg overflow-hidden', className)}>
        {showToolbar && (
          <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-300">
            <div className="flex items-center gap-1 flex-wrap">
              {!isPreviewMode && (
                <>
                  {/* Text formatting */}
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    disabled={disabled}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    disabled={disabled}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    disabled={disabled}
                    title="Strikethrough"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarSeparator />

                  {/* Lists */}
                  <ToolbarButton
                    onClick={() => {
                      editor.chain().focus().toggleBulletList().run()
                    }}
                    isActive={editor.isActive('bulletList')}
                    disabled={disabled}
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => {
                      editor.chain().focus().toggleOrderedList().run()
                    }}
                    isActive={editor.isActive('orderedList')}
                    disabled={disabled}
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarSeparator />

                  {/* Block formatting */}
                  <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    disabled={disabled}
                    title="Quote"
                  >
                    <Quote className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarSeparator />

                  {/* Links */}
                  <ToolbarButton
                    onClick={openLinkModal}
                    isActive={editor.isActive('link')}
                    disabled={disabled}
                    title="Add Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={removeLink}
                    disabled={disabled || !editor.isActive('link')}
                    title="Remove Link"
                  >
                    <Unlink className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarSeparator />

                  {/* Headings */}
                  <select
                    onChange={(e) => {
                      const level = parseInt(e.target.value)
                      if (level === 0) {
                        editor.chain().focus().setParagraph().run()
                      } else {
                        editor.chain().focus().toggleHeading({ level: level as any }).run()
                      }
                    }}
                    value={
                      editor.isActive('heading', { level: 1 }) ? 1 :
                      editor.isActive('heading', { level: 2 }) ? 2 :
                      editor.isActive('heading', { level: 3 }) ? 3 : 0
                    }
                    disabled={disabled}
                    className="px-3 py-1 border border-gray-300 rounded text-sm bg-white"
                  >
                    <option value={0}>Paragraph</option>
                    <option value={1}>Heading 1</option>
                    <option value={2}>Heading 2</option>
                    <option value={3}>Heading 3</option>
                  </select>
                </>
              )}
            </div>

            {/* Preview toggle */}
            {showPreview && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {isPreviewMode ? 'Preview' : 'Edit'}
                </span>
                <ToolbarButton
                  onClick={togglePreview}
                  isActive={isPreviewMode}
                  disabled={disabled}
                  title={isPreviewMode ? 'Switch to Edit Mode' : 'Switch to Preview Mode'}
                >
                  {isPreviewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </ToolbarButton>
              </div>
            )}
          </div>
        )}
        
        <div 
          className="p-4 focus-within:ring-2 focus-within:ring-[var(--cbre-green)]"
          style={{ minHeight }}
        >
          {isPreviewMode ? (
            <RichTextRenderer 
              content={content}
              className="min-h-full"
              fallback={
                <div className="text-gray-500 italic text-center py-8">
                  No content to preview. Switch to edit mode to start writing.
                </div>
              }
            />
          ) : (
            <EditorContent 
              editor={editor}
              className={cn(
                'outline-none prose prose-sm max-w-none',
                '[&_.ProseMirror]:outline-none',
                '[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:my-2',
                '[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:my-2',
                '[&_.ProseMirror_li]:my-1',
                '[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-gray-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            />
          )}
        </div>
        
        {/* Status bar */}
        {showToolbar && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-300 text-xs text-gray-500 flex justify-between">
            <span>
              {isPreviewMode ? 'Preview Mode' : 'Edit Mode'}
            </span>
            <span>
              {editor.storage.characterCount?.characters() || 0} characters
            </span>
          </div>
        )}
      </div>

      {/* Custom Link Modal */}
      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSubmit={handleAddLink}
      />
    </>
  )
}

// Export utility functions for working with rich text content
export const createEmptyContent = () => '<p></p>'

export const isContentEmpty = (content: string): boolean => {
  if (!content || content.trim() === '') return true
  
  // Check if content is just empty paragraph tags
  const cleanContent = content.replace(/<p><\/p>/g, '').replace(/\s/g, '')
  return cleanContent === ''
}

export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '')
}

export const getWordCount = (html: string): number => {
  const text = stripHtml(html)
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
} 