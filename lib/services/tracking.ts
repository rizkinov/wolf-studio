import { createClient } from '@/lib/supabase/client'

// Generate a unique session ID for the user
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Get or create session ID from localStorage
const getSessionId = (): string => {
  if (typeof window === 'undefined') return generateSessionId()
  
  let sessionId = localStorage.getItem('wolf_studio_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('wolf_studio_session_id', sessionId)
  }
  return sessionId
}

// Get client IP (note: this is approximate and depends on headers)
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip || 'unknown'
  } catch {
    return 'unknown'
  }
}

export class TrackingService {
  private static startTime: number = 0
  private static currentProjectId: string | null = null
  
  // Initialize session tracking
  static async initializeSession(): Promise<void> {
    if (typeof window === 'undefined') return
    
    const sessionId = getSessionId()
    const userAgent = navigator.userAgent
    const userIP = await getClientIP()
    
    try {
      const supabase = createClient()
      
      // Update or create session with proper conflict resolution
      await supabase
        .from('user_sessions')
        .upsert({
          session_id: sessionId,
          user_ip: userIP,
          user_agent: userAgent,
          started_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          page_views_count: 0,
          total_duration: 0
        }, {
          onConflict: 'session_id'
        })
        .select()
        .single()
        
    } catch (error) {
      console.error('Error initializing session:', error)
    }
  }
  
  // Track page view for a project
  static async trackProjectView(projectSlug: string): Promise<void> {
    if (typeof window === 'undefined') return
    
    const sessionId = getSessionId()
    const userAgent = navigator.userAgent
    const userIP = await getClientIP()
    const referrer = document.referrer || null
    
    // Record start time for duration tracking
    this.startTime = Date.now()
    this.currentProjectId = projectSlug
    
    try {
      const supabase = createClient()
      
      // First, look up the project ID from the slug
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', projectSlug)
        .single()
      
      if (projectError || !project) {
        console.error('Project not found for slug:', projectSlug, projectError)
        return
      }
      
              // Insert page view with the actual project UUID
      await supabase
        .from('page_views')
        .insert({
          project_id: project.id,
          user_ip: userIP,
          user_agent: userAgent,
          referrer: referrer,
          session_id: sessionId
        })
        
        // Handle session tracking - upsert pattern to handle existing/new sessions
        const { data: existingSession } = await supabase
          .from('user_sessions')
          .select('page_views_count')
          .eq('session_id', sessionId)
          .maybeSingle() // Use maybeSingle instead of single to handle no results
        
        if (existingSession) {
          // Update existing session
          await supabase
            .from('user_sessions')
            .update({
              last_activity: new Date().toISOString(),
              page_views_count: (existingSession.page_views_count || 0) + 1
            })
            .eq('session_id', sessionId)
        } else {
          // Create new session
          await supabase
            .from('user_sessions')
            .insert({
              session_id: sessionId,
              user_ip: userIP,
              user_agent: userAgent,
              started_at: new Date().toISOString(),
              last_activity: new Date().toISOString(),
              page_views_count: 1,
              total_duration: 0
            })
        }
        
    } catch (error) {
      console.error('Error tracking project view:', error)
    }
  }
  
  // Track when user leaves the page (for duration)
  static async trackPageLeave(): Promise<void> {
    if (typeof window === 'undefined' || !this.currentProjectId || !this.startTime) return
    
    const duration = Math.round((Date.now() - this.startTime) / 1000) // in seconds
    const sessionId = getSessionId()
    
    try {
      const supabase = createClient()
      
      // Look up the project ID from the slug
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', this.currentProjectId)
        .single()
      
      if (projectError || !project) {
        console.error('Project not found for slug:', this.currentProjectId, projectError)
        return
      }
      
      // Update the most recent page view with duration
      await supabase
        .from('page_views')
        .update({ view_duration: duration })
        .eq('project_id', project.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        
              // Update session total duration
        const { data: session } = await supabase
          .from('user_sessions')
          .select('total_duration')
          .eq('session_id', sessionId)
          .maybeSingle() // Use maybeSingle to handle missing sessions
        
        if (session) {
          await supabase
            .from('user_sessions')
            .update({
              total_duration: (session.total_duration || 0) + duration,
              last_activity: new Date().toISOString()
            })
            .eq('session_id', sessionId)
        }
        
    } catch (error) {
      console.error('Error tracking page leave:', error)
    }
  }
  
  // Track engagement events (scrolling, clicking, etc.)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async trackEngagement(_projectId: string, _eventType: string, _eventData?: unknown): Promise<void> {
    if (typeof window === 'undefined') return
    
    const sessionId = getSessionId()
    
    try {
      const supabase = createClient()
      
      // For now, we'll update the session last activity
      // In a more complex setup, you might want a separate engagement_events table
      await supabase
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        
    } catch (error) {
      console.error('Error tracking engagement:', error)
    }
  }
  
  // Get real-time analytics for a project
  static async getProjectAnalytics(projectId: string): Promise<{
    totalViews: number
    uniqueVisitors: number
    averageTimeOnPage: number
    bounceRate: number
    lastViewed: string | null
  } | null> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('project_analytics')
        .select('*')
        .eq('project_id', projectId)
        .single()
        
      if (error || !data) {
        return {
          totalViews: 0,
          uniqueVisitors: 0,
          averageTimeOnPage: 0,
          bounceRate: 0,
          lastViewed: null
        }
      }
      
      return {
        totalViews: data.total_views || 0,
        uniqueVisitors: data.unique_visitors || 0,
        averageTimeOnPage: parseFloat(data.average_time_on_page) || 0,
        bounceRate: parseFloat(data.bounce_rate) || 0,
        lastViewed: data.last_viewed
      }
    } catch (error) {
      console.error('Error getting project analytics:', error)
      return null
    }
  }
}

// Set up automatic tracking
if (typeof window !== 'undefined') {
  // Initialize session when the module loads
  TrackingService.initializeSession()
  
  // Track page leaves
  window.addEventListener('beforeunload', () => {
    TrackingService.trackPageLeave()
  })
  
  // Track visibility changes (user switching tabs, etc.)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      TrackingService.trackPageLeave()
    }
  })
} 