const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function migrateBannerImages() {
  // Create admin client with service role
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    console.log('🔄 Starting banner image migration...')

    // Get all projects with banner images
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, banner_image_url')
      .not('banner_image_url', 'is', null)
      .not('banner_image_url', 'eq', '')

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return
    }

    console.log(`📋 Found ${projects.length} projects with banner images`)

    let successCount = 0
    let skipCount = 0

    for (const project of projects) {
      try {
        // Check if banner image already exists in project_images
        const { data: existingImage, error: checkError } = await supabase
          .from('project_images')
          .select('id')
          .eq('project_id', project.id)
          .eq('image_type', 'banner')
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`Error checking existing image for project ${project.title}:`, checkError)
          continue
        }

        if (existingImage) {
          console.log(`⏭️  Banner image already exists for project: ${project.title}`)
          skipCount++
          continue
        }

        // Insert banner image into project_images table
        const { error: insertError } = await supabase
          .from('project_images')
          .insert({
            project_id: project.id,
            image_url: project.banner_image_url,
            image_type: 'banner',
            display_order: 0,
            alt_text: `${project.title} banner image`
          })

        if (insertError) {
          console.error(`Error inserting banner image for project ${project.title}:`, insertError)
          continue
        }

        console.log(`✅ Migrated banner image for project: ${project.title}`)
        successCount++
      } catch (error) {
        console.error(`Error processing project ${project.title}:`, error)
      }
    }

    console.log('\n🎉 Migration completed!')
    console.log(`✅ Successfully migrated: ${successCount} banner images`)
    console.log(`⏭️  Skipped (already exists): ${skipCount} banner images`)

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Run the migration
migrateBannerImages()
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  }) 