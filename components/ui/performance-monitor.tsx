'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Separator } from './separator'
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface PerformanceMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
  fcp: number | null
  memoryUsage: number | null
  renderTime: number | null
  bundleSize: number | null
}

interface PerformanceEntry extends globalThis.PerformanceEntry {
  value?: number
  hadRecentInput?: boolean
  processingStart?: number
  startTime: number
}

interface PerformanceNavigationTimingEntry extends PerformanceNavigationTiming {
  responseStart: number
  requestStart: number
}

interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

interface PerformanceWithMemory extends Performance {
  memory?: MemoryInfo
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    memoryUsage: null,
    renderTime: null,
    bundleSize: null,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const observersRef = useRef<PerformanceObserver[]>([])

  const updateMetric = (key: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const setupObservers = () => {
      // Track LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: PerformanceEntry) => {
          updateMetric('lcp', entry.startTime)
        })
      })

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        observersRef.current.push(lcpObserver)
      } catch (_e) {
        // Silently fail if not supported
      }

      // Track FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: PerformanceEntry) => {
          if (entry.processingStart && entry.startTime) {
            updateMetric('fid', entry.processingStart - entry.startTime)
          }
        })
      })

      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
        observersRef.current.push(fidObserver)
      } catch (_e) {
        // Silently fail if not supported
      }

      // Track CLS (Cumulative Layout Shift)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: PerformanceEntry) => {
          if (!entry.hadRecentInput && entry.value) {
            clsValue += entry.value
            updateMetric('cls', clsValue)
          }
        })
      })

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        observersRef.current.push(clsObserver)
      } catch (_e) {
        // Silently fail if not supported
      }

      // Track TTFB (Time to First Byte)
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTimingEntry
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart
        updateMetric('ttfb', ttfb)
      }

      // Track FCP (First Contentful Paint)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: PerformanceEntry) => {
          updateMetric('fcp', entry.startTime)
        })
      })

      try {
        fcpObserver.observe({ entryTypes: ['paint'] })
        observersRef.current.push(fcpObserver)
      } catch (_e) {
        // Silently fail if not supported
      }

      // Track Memory Usage
      const updateMemoryUsage = () => {
        const performanceWithMemory = performance as PerformanceWithMemory
        if (performanceWithMemory.memory) {
          const memoryUsage = (performanceWithMemory.memory.usedJSHeapSize / performanceWithMemory.memory.jsHeapSizeLimit) * 100
          updateMetric('memoryUsage', memoryUsage)
        }
      }

      updateMemoryUsage()
      const memoryInterval = setInterval(updateMemoryUsage, 5000)

      return () => {
        clearInterval(memoryInterval)
        observersRef.current.forEach(observer => observer.disconnect())
        observersRef.current = []
      }
    }

    const cleanup = setupObservers()

    return cleanup
  }, [])

  const refreshMetrics = () => {
    setIsRefreshing(true)
    
    // Clear current metrics
    setMetrics({
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
      fcp: null,
      memoryUsage: null,
      renderTime: null,
      bundleSize: null,
    })

    // Disconnect existing observers
    observersRef.current.forEach(observer => observer.disconnect())
    observersRef.current = []

    // Restart collection
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const getMetricStatus = (metric: keyof PerformanceMetrics, value: number | null) => {
    if (value === null) return { status: 'unknown', color: 'gray' }

    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 },
      fcp: { good: 1800, poor: 3000 },
      memoryUsage: { good: 50, poor: 80 },
      renderTime: { good: 100, poor: 300 },
      bundleSize: { good: 244, poor: 512 },
    }

    const threshold = thresholds[metric]
    if (value <= threshold.good) return { status: 'good', color: 'green' }
    if (value <= threshold.poor) return { status: 'needs-improvement', color: 'yellow' }
    return { status: 'poor', color: 'red' }
  }

  const formatValue = (metric: keyof PerformanceMetrics, value: number | null) => {
    if (value === null) return 'N/A'
    
    switch (metric) {
      case 'lcp':
      case 'fid':
      case 'ttfb':
      case 'fcp':
      case 'renderTime':
        return `${Math.round(value)}ms`
      case 'cls':
        return value.toFixed(3)
      case 'memoryUsage':
        return `${Math.round(value)}%`
      case 'bundleSize':
        return `${Math.round(value)}KB`
      default:
        return value.toString()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'needs-improvement':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const calculateOverallScore = () => {
    const validMetrics = Object.entries(metrics).filter(([_, value]) => value !== null)
    if (validMetrics.length === 0) return 0

    const scores = validMetrics.map(([key, value]) => {
      const status = getMetricStatus(key as keyof PerformanceMetrics, value)
      switch (status.status) {
        case 'good': return 100
        case 'needs-improvement': return 50
        case 'poor': return 0
        default: return 0
      }
    })

    return Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length)
  }

  const renderMetricCard = (
    key: keyof PerformanceMetrics,
    title: string,
    description: string,
    value: number | null
  ) => {
    const { status, color } = getMetricStatus(key, value)
    const formattedValue = formatValue(key, value)

    return (
      <Card key={key} className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getStatusIcon(status)}
            {title}
          </CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-2xl font-bold">{formattedValue}</div>
          <Badge variant={color === 'green' ? 'default' : color === 'yellow' ? 'secondary' : 'destructive'}>
            {status.replace('-', ' ')}
          </Badge>
        </CardContent>
      </Card>
    )
  }

  const overallScore = calculateOverallScore()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Performance Monitor</CardTitle>
            <CardDescription>Real-time application performance metrics</CardDescription>
          </div>
          <Button 
            onClick={refreshMetrics} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Overall Performance Score</h3>
              <p className="text-xs text-muted-foreground">
                Based on Core Web Vitals and other metrics
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{overallScore}</div>
              <div className="text-xs text-muted-foreground">/ 100</div>
            </div>
          </div>

          <Separator />

          {/* Core Web Vitals */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Core Web Vitals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderMetricCard('lcp', 'LCP', 'Largest Contentful Paint', metrics.lcp)}
              {renderMetricCard('fid', 'FID', 'First Input Delay', metrics.fid)}
              {renderMetricCard('cls', 'CLS', 'Cumulative Layout Shift', metrics.cls)}
            </div>
          </div>

          <Separator />

          {/* Additional Metrics */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Additional Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderMetricCard('ttfb', 'TTFB', 'Time to First Byte', metrics.ttfb)}
              {renderMetricCard('fcp', 'FCP', 'First Contentful Paint', metrics.fcp)}
              {renderMetricCard('memoryUsage', 'Memory', 'JavaScript Memory Usage', metrics.memoryUsage)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 