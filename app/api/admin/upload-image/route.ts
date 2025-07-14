import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const imageType = formData.get('imageType') as string || 'gallery'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    
    // Determine storage path
    const storagePath = projectId 
      ? `${imageType}s/${projectId}/${fileName}`
      : `temp/${fileName}`

    // Upload to Supabase Storage using admin client
    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('project-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrlData } = adminSupabase.storage
      .from('project-images')
      .getPublicUrl(storagePath)

    // Create database record if project is specified
    let imageId = uuidv4()
    if (projectId) {
      // Get next display order
      const { data: existingImages } = await adminSupabase
        .from('project_images')
        .select('display_order')
        .eq('project_id', projectId)
        .eq('image_type', imageType)
        .order('display_order', { ascending: false })
        .limit(1)

      const nextOrder = existingImages && existingImages.length > 0 
        ? existingImages[0].display_order + 1 
        : 0

      const { data: insertedImage, error: insertError } = await adminSupabase
        .from('project_images')
        .insert({
          project_id: projectId,
          image_url: publicUrlData.publicUrl,
          storage_path: storagePath,
          image_type: imageType,
          display_order: nextOrder,
          file_size: file.size,
          mime_type: file.type,
          alt_text: `${imageType} image for project`
        })
        .select()
        .single()

      if (insertError) {
        console.error('Database insert error:', insertError)
        return NextResponse.json({ error: `Failed to create image record: ${insertError.message}` }, { status: 500 })
      }

      imageId = insertedImage.id
    }

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: storagePath,
      imageId,
      metadata: {
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 