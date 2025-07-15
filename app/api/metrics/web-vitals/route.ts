// API endpoint for collecting Web Vitals metrics
import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/services/performance-monitor'
import { logger } from '@/lib/services/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.value || !body.id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, value, id' },
        { status: 400 }
      )
    }
    
    // Extract Web Vitals metrics
    const webVitalsMetrics = {
      name: body.name,
      value: parseFloat(body.value),
      id: body.id,
      delta: parseFloat(body.delta) || 0,
      rating: body.rating || 'needs-improvement',
      navigationType: body.navigationType || 'unknown'
    }
    
    // Track the metrics
    performanceMonitor.trackWebVitals(webVitalsMetrics)
    
    // Log the collection
    logger.info('Web Vitals metrics collected', {
      name: webVitalsMetrics.name,
      value: webVitalsMetrics.value,
      rating: webVitalsMetrics.rating
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    logger.error('Failed to collect Web Vitals metrics', error as Error)
    return NextResponse.json(
      { error: 'Failed to collect metrics' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get recent Web Vitals metrics
    const metrics = performanceMonitor.getMetrics('webVitals', 50)
    
    return NextResponse.json({
      success: true,
      data: metrics
    })
    
  } catch (error) {
    logger.error('Failed to retrieve Web Vitals metrics', error as Error)
    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    )
  }
} 