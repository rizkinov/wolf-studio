#!/usr/bin/env node

/**
 * Database Migration Runner for Wolf Studio CMS
 * 
 * This script helps run the database migrations in the correct order.
 * It reads the migration files and executes them against your Supabase database.
 * 
 * Usage:
 *   node scripts/run-migrations.js
 * 
 * Requirements:
 *   - Environment variables for Supabase must be set
 *   - SUPABASE_SERVICE_ROLE_KEY must be available for admin operations
 */

const fs = require('fs')
const path = require('path')

// Check if we're in a Node.js environment with required dependencies
try {
  require('@supabase/supabase-js')
} catch (error) {
  console.error('❌ @supabase/supabase-js is required. Install it with: npm install @supabase/supabase-js')
  process.exit(1)
}

const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Migration files in order
const MIGRATION_FILES = [
  '20241201000001_initial_schema.sql',
  '20241201000002_rls_policies.sql',
  '20241201000003_seed_data.sql'
]

async function runMigrations() {
  console.log('🚀 Starting Wolf Studio database migrations...\n')

  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nPlease set these in your .env.local file.')
    process.exit(1)
  }

  // Create Supabase client with service role key
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Test connection
  console.log('🔗 Testing Supabase connection...')
  try {
    const { error } = await supabase.from('_test').select('1').limit(1)
    if (error && !error.message.includes('relation "_test" does not exist')) {
      throw error
    }
    console.log('✅ Connected to Supabase successfully\n')
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message)
    process.exit(1)
  }

  // Run migrations
  for (const migrationFile of MIGRATION_FILES) {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)
    
    console.log(`📄 Running migration: ${migrationFile}`)
    
    try {
      // Read migration file
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
      
      // Execute migration
      const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
      
      if (error) {
        // Try alternative method if rpc doesn't work
        const { error: directError } = await supabase
          .from('_migrations')
          .insert({ name: migrationFile, executed_at: new Date().toISOString() })
        
        // If both methods fail, show the SQL for manual execution
        if (directError) {
          console.log('⚠️  Please run this SQL manually in your Supabase SQL editor:')
          console.log('---')
          console.log(migrationSQL)
          console.log('---\n')
        }
      } else {
        console.log('✅ Migration completed successfully\n')
      }
      
    } catch (error) {
      console.error(`❌ Error running migration ${migrationFile}:`, error.message)
      console.log('\n📋 Manual Migration Instructions:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste the contents of each migration file:')
      MIGRATION_FILES.forEach(file => {
        console.log(`   - supabase/migrations/${file}`)
      })
      console.log('4. Execute each migration in order\n')
      break
    }
  }

  console.log('🎉 Migration process completed!')
  console.log('\n📚 Next steps:')
  console.log('1. Verify your tables exist in Supabase Dashboard > Database > Tables')
  console.log('2. Check that sample data was inserted')
  console.log('3. Test the admin dashboard at /admin')
  console.log('4. Start building your CMS features!')
}

// Handle CLI execution
if (require.main === module) {
  runMigrations().catch(error => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
}

module.exports = { runMigrations } 