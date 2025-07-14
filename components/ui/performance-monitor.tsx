'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  imageLoadTime?: number
  totalImages?: number
  loadedImages?: number
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
  enableConsoleLogging?: boolean
}

export function PerformanceMonitor({ 
  onMetricsUpdate, 
  enableConsoleLogging = false 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})

  useEffect(() => {
    // Track Core Web Vitals
    const trackWebVitals = () => {
      // Track FCP (First Contentful Paint)
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry
      if (fcpEntry) {
        updateMetric('fcp', fcpEntry.startTime)
      }

      // Track LCP (Largest Contentful Paint)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        updateMetric('lcp', lastEntry.startTime)
      })
      
      if ('PerformanceObserver' in window) {
        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch (e) {
          // Silently fail if not supported
        }
      }

      // Track FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          updateMetric('fid', entry.processingStart - entry.startTime)
        })
      })

      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        // Silently fail if not supported
      }

      // Track CLS (Cumulative Layout Shift)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            updateMetric('cls', clsValue)
          }
        })
      })

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        // Silently fail if not supported
      }

      // Track TTFB (Time to First Byte)
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
        updateMetric('ttfb', ttfb)
      }

      return () => {
        observer.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
      }
    }

    // Track image loading performance
    const trackImagePerformance = () => {
      const images = document.querySelectorAll('img')
      let loadedCount = 0
      let totalLoadTime = 0

      updateMetric('totalImages', images.length)

      images.forEach((img) => {
        const startTime = performance.now()
        
        const onLoad = () => {
          const loadTime = performance.now() - startTime
          loadedCount++
          totalLoadTime += loadTime
          
          updateMetric('loadedImages', loadedCount)
          updateMetric('imageLoadTime', totalLoadTime / loadedCount)
          
          img.removeEventListener('load', onLoad)
          img.removeEventListener('error', onError)
        }

        const onError = () => {
          loadedCount++
          updateMetric('loadedImages', loadedCount)
          
          img.removeEventListener('load', onLoad)
          img.removeEventListener('error', onError)
        }

        if (img.complete) {
          onLoad()
        } else {
          img.addEventListener('load', onLoad)
          img.addEventListener('error', onError)
        }
      })
    }

    const updateMetric = (key: keyof PerformanceMetrics, value: number) => {
      setMetrics(prev => {
        const updated = { ...prev, [key]: value }
        
        if (enableConsoleLogging) {
          console.log(`[Performance] ${key}:`, value)
        }
        
        onMetricsUpdate?.(updated)
        return updated
      })
    }

    // Initialize tracking
    const cleanup = trackWebVitals()
    
    // Track images after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', trackImagePerformance)
    } else {
      trackImagePerformance()
    }

    // Track images that load dynamically
    const imageObserver = new MutationObserver(() => {
      trackImagePerformance()
    })

    imageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    })

    return () => {
      cleanup?.()
      imageObserver.disconnect()
      document.removeEventListener('DOMContentLoaded', trackImagePerformance)
    }
  }, [onMetricsUpdate, enableConsoleLogging])

  // Don't render anything in production
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
      <div className="font-bold mb-2">Performance Metrics</div>
      <div className="space-y-1">
        {metrics.fcp && (
          <div className={getMetricColor('fcp', metrics.fcp)}>
            FCP: {Math.round(metrics.fcp)}ms
          </div>
        )}
        {metrics.lcp && (
          <div className={getMetricColor('lcp', metrics.lcp)}>
            LCP: {Math.round(metrics.lcp)}ms
          </div>
        )}
        {metrics.fid && (
          <div className={getMetricColor('fid', metrics.fid)}>
            FID: {Math.round(metrics.fid)}ms
          </div>
        )}
        {metrics.cls && (
          <div className={getMetricColor('cls', metrics.cls)}>
            CLS: {metrics.cls.toFixed(3)}
          </div>
        )}
        {metrics.ttfb && (
          <div className={getMetricColor('ttfb', metrics.ttfb)}>
            TTFB: {Math.round(metrics.ttfb)}ms
          </div>
        )}
        {metrics.totalImages !== undefined && (
          <div>
            Images: {metrics.loadedImages || 0}/{metrics.totalImages}
            {metrics.imageLoadTime && (
              <span className="ml-1">
                (avg: {Math.round(metrics.imageLoadTime)}ms)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to color-code metrics based on performance thresholds
function getMetricColor(metric: string, value: number): string {
  const thresholds = {
    fcp: { good: 1800, poor: 3000 }, // First Contentful Paint
    lcp: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    fid: { good: 100, poor: 300 },   // First Input Delay
    cls: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
    ttfb: { good: 600, poor: 1500 }  // Time to First Byte
  }

  const threshold = thresholds[metric as keyof typeof thresholds]
  if (!threshold) return 'text-white'

  if (value <= threshold.good) return 'text-green-400'
  if (value <= threshold.poor) return 'text-yellow-400'
  return 'text-red-400'
}

// Hook for programmatic performance tracking
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})

  const logPerformance = () => {
    console.table(metrics)
  }

  const getPerformanceScore = (): number => {
    let score = 100
    
    // Deduct points based on metrics
    if (metrics.fcp && metrics.fcp > 1800) score -= 10
    if (metrics.lcp && metrics.lcp > 2500) score -= 15
    if (metrics.fid && metrics.fid > 100) score -= 10
    if (metrics.cls && metrics.cls > 0.1) score -= 15
    if (metrics.ttfb && metrics.ttfb > 600) score -= 10

    return Math.max(0, score)
  }

  return {
    metrics,
    setMetrics,
    logPerformance,
    getPerformanceScore
  }
}

// Component for production performance reporting
export function PerformanceReporter() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return

    const reportMetrics = (metrics: PerformanceMetrics) => {
      // Send metrics to analytics service
      // This would integrate with your analytics provider (GA, Mixpanel, etc.)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          custom_parameter_1: metrics.lcp,
          custom_parameter_2: metrics.fid,
          custom_parameter_3: metrics.cls
        })
      }
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        // Report to analytics
        reportMetrics({ [entry.name]: entry.startTime })
      })
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] })
    } catch (e) {
      // Silently fail if not supported
    }

    return () => observer.disconnect()
  }, [])

  return null
} 