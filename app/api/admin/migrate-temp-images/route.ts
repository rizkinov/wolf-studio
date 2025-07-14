import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with service role
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Create regular client for auth check
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    const { projectId, tempImageUrls } = await request.json()

    if (!projectId || !tempImageUrls || !Array.isArray(tempImageUrls)) {
      return NextResponse.json({ error: 'Missing projectId or tempImageUrls' }, { status: 400 })
    }

    console.log(`Migrating ${tempImageUrls.length} temp images for project ${projectId}`)

    const results = []

    for (let index = 0; index < tempImageUrls.length; index++) {
      const imageUrl = tempImageUrls[index]
      
      try {
        // Extract filename from temp URL
        const tempPath = imageUrl.split('/project-images/')[1]
        if (!tempPath || !tempPath.startsWith('temp/')) {
          console.warn('Image URL not in expected temp format:', imageUrl)
          results.push({ success: false, error: 'Invalid temp URL format' })
          continue
        }
        
        const filename = tempPath.replace('temp/', '')
        const newPath = `gallery/${projectId}/${filename}`
        
        // Move file from temp to proper location
        const { error: moveError } = await adminSupabase.storage
          .from('project-images')
          .move(tempPath, newPath)
        
        if (moveError) {
          console.error('Error moving file:', moveError)
          // If move fails, try to use original URL anyway
          const { data: insertedImage, error: insertError } = await adminSupabase
            .from('project_images')
            .insert({
              project_id: projectId,
              image_url: imageUrl,
              image_type: 'gallery',
              display_order: index,
              alt_text: `Gallery image ${index + 1}`
            })
            .select()
            .single()
          
          if (insertError) {
            console.error('Database insert error with original URL:', insertError)
            results.push({ success: false, error: `Move failed and DB insert failed: ${insertError.message}` })
          } else {
            results.push({ success: true, imageId: insertedImage.id, url: imageUrl, moved: false })
          }
          continue
        }
        
        // Get new public URL
        const { data: newUrlData } = adminSupabase.storage
          .from('project-images')
          .getPublicUrl(newPath)
        
        // Create database record with new URL
        const { data: insertedImage, error: insertError } = await adminSupabase
          .from('project_images')
          .insert({
            project_id: projectId,
            image_url: newUrlData.publicUrl,
            storage_path: newPath,
            image_type: 'gallery',
            display_order: index,
            file_size: null, // We don't have this from temp uploads
            mime_type: filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
            alt_text: `Gallery image ${index + 1}`
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('Database insert error:', insertError)
          results.push({ success: false, error: `File moved but DB insert failed: ${insertError.message}` })
        } else {
          results.push({ 
            success: true, 
            imageId: insertedImage.id, 
            url: newUrlData.publicUrl, 
            moved: true,
            storagePath: newPath
          })
        }
        
      } catch (error) {
        console.error('Error processing image:', error)
        results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    const successCount = results.filter(r => r.success).length
    
    return NextResponse.json({
      success: true,
      processed: tempImageUrls.length,
      successful: successCount,
      failed: tempImageUrls.length - successCount,
      results
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 