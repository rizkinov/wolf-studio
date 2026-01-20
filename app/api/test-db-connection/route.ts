// Test endpoint to verify Prisma database connection
// This endpoint checks connectivity and counts records in main tables
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection by counting records in main tables
    const [projectCount, categoryCount, imageCount, userProfileCount] = await Promise.all([
      prisma.project.count(),
      prisma.category.count(),
      prisma.projectImage.count(),
      prisma.userProfile.count(),
    ])

    return NextResponse.json({
      success: true,
      database: 'Azure PostgreSQL via Prisma',
      connection: 'Established',
      timestamp: new Date().toISOString(),
      counts: {
        projects: projectCount,
        categories: categoryCount,
        images: imageCount,
        userProfiles: userProfileCount,
      },
      message: 'Database connected successfully'
    })
  } catch (error: any) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      database: 'Azure PostgreSQL via Prisma',
      connection: 'Failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 })
  }
}
