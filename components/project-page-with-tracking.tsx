'use client'

import React, { useEffect } from 'react'
import { TrackingService } from '@/lib/services/tracking'

interface ProjectPageWithTrackingProps {
  projectId: string
  children: React.ReactNode
}

/**
 * Higher-order component that adds analytics tracking to project pages
 * 
 * Usage:
 * export default function ProjectPage() {
 *   const projectId = 'your-project-id-from-cms'
 *   
 *   return (
 *     <ProjectPageWithTracking projectId={projectId}>
 *       Your project content here
 *     </ProjectPageWithTracking>
 *   )
 * }
 */
export function ProjectPageWithTracking({ projectId, children }: ProjectPageWithTrackingProps) {
  useEffect(() => {
    if (projectId) {
      TrackingService.trackProjectView(projectId)
    }
  }, [projectId])

  return <>{children}</>
}

/**
 * Hook for adding tracking to existing project pages
 * 
 * Usage:
 * export default function ProjectPage() {
 *   const projectId = 'your-project-id-from-cms'
 *   useProjectTracking(projectId)
 *   
 *   return (
 *     <div>
 *       Your project content
 *     </div>
 *   )
 * }
 */
export function useProjectTracking(projectId: string) {
  useEffect(() => {
    if (projectId) {
      TrackingService.trackProjectView(projectId)
    }
  }, [projectId])
} 