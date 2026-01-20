// Test endpoint to verify project data fetching with Prisma
// This endpoint fetches sample projects with relationships to verify data integrity
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch first 5 published projects with their relationships
    const projects = await prisma.project.findMany({
      take: 5,
      where: {
        isPublished: true,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            displayOrder: 'asc',
          },
          take: 3, // Limit to first 3 images per project
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    })

    // Transform to simpler format for testing
    const simplifiedProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      category: project.category?.name || 'Uncategorized',
      year: project.year,
      location: project.location,
      imageCount: project.images.length,
      images: project.images.map(img => ({
        url: img.imageUrl,
        altText: img.altText,
      })),
      published: project.isPublished,
    }))

    return NextResponse.json({
      success: true,
      count: simplifiedProjects.length,
      projects: simplifiedProjects,
      message: 'Projects fetched successfully from Azure PostgreSQL'
    })
  } catch (error: any) {
    console.error('Failed to fetch test projects:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 })
  }
}
