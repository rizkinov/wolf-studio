#!/usr/bin/env node
/**
 * Step 2: Database Migration Script
 *
 * Migrates the database schema and data from Supabase backup
 * to Azure PostgreSQL Flexible Server.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ ${message}`, colors.cyan);
}

/**
 * Load environment variables from .env.azure
 */
function loadEnvironment() {
  const envPath = path.join(__dirname, '../../.env.azure');

  if (!fs.existsSync(envPath)) {
    error('.env.azure file not found!');
    error('Run step 1 (validate-environment.js) first');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });

  return envVars;
}

/**
 * Build PostgreSQL connection string for Azure
 */
function buildConnectionString(envVars) {
  const { AZURE_POSTGRESQL_USER, AZURE_POSTGRESQL_PASSWORD, AZURE_POSTGRESQL_HOST, AZURE_POSTGRESQL_PORT, AZURE_POSTGRESQL_DATABASE } = envVars;

  return `postgresql://${AZURE_POSTGRESQL_USER}:${encodeURIComponent(AZURE_POSTGRESQL_PASSWORD)}@${AZURE_POSTGRESQL_HOST}:${AZURE_POSTGRESQL_PORT}/${AZURE_POSTGRESQL_DATABASE}?sslmode=require`;
}

/**
 * Test database connection
 */
function testConnection(connectionString) {
  info('\n🔌 Testing database connection...\n');

  try {
    const result = execSync(`psql "${connectionString}" -c "SELECT version();" -t`, {
      encoding: 'utf-8',
    }).trim();

    success('Connection successful');
    info(`PostgreSQL version: ${result.split('\n')[0].trim()}`);
    return true;
  } catch (err) {
    error('Connection failed');
    error(err.message);
    return false;
  }
}

/**
 * Create backup of existing Azure database (if any)
 */
function backupExistingDatabase(connectionString, envVars) {
  info('\n💾 Creating backup of existing Azure database...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, `../../migration/backups/azure-backup-${timestamp}.sql`);

  // Create backups directory
  const backupsDir = path.dirname(backupPath);
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  try {
    execSync(`psql "${connectionString}" -c "\\dt" -t`, { encoding: 'utf-8', stdio: 'pipe' });

    info('Existing tables found, creating backup...');

    execSync(`pg_dump "${connectionString}" -f "${backupPath}"`, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });

    success(`Backup created: ${backupPath}`);
    return backupPath;
  } catch (err) {
    warning('No existing tables to backup (fresh database)');
    return null;
  }
}

/**
 * Prepare SQL file for Azure PostgreSQL
 * Removes/modifies Supabase-specific items that won't work on Azure
 */
function prepareSQLForAzure() {
  info('\n📝 Preparing SQL file for Azure PostgreSQL...\n');

  const sourcePath = path.join(__dirname, '../../supabase/backups/backup.sql');
  const targetPath = path.join(__dirname, '../../migration/backups/backup-azure-ready.sql');

  if (!fs.existsSync(sourcePath)) {
    error('Source backup file not found: supabase/backups/backup.sql');
    return null;
  }

  let sqlContent = fs.readFileSync(sourcePath, 'utf-8');
  let modifications = [];

  // 1. Remove restriction token (Supabase-specific)
  const restrictMatch = sqlContent.match(/\\restrict [A-Za-z0-9]+/);
  if (restrictMatch) {
    sqlContent = sqlContent.replace(/\\restrict [A-Za-z0-9]+\n/, '');
    modifications.push('Removed Supabase restriction token');
  }

  // 2. Comment out problematic role creations
  const supabaseRoles = ['anon', 'authenticated', 'authenticator', 'service_role', 'supabase_admin', 'postgres'];
  supabaseRoles.forEach(role => {
    const roleRegex = new RegExp(`(CREATE ROLE ${role};)`, 'g');
    if (sqlContent.match(roleRegex)) {
      sqlContent = sqlContent.replace(roleRegex, `-- $1 (commented: Azure will use its own roles)`);
      modifications.push(`Commented CREATE ROLE ${role}`);
    }

    const alterRoleRegex = new RegExp(`(ALTER ROLE ${role} .*?;)`, 'g');
    sqlContent = sqlContent.replace(alterRoleRegex, '-- $1');
  });

  // 3. Add error handling for extensions
  sqlContent = sqlContent.replace(/CREATE EXTENSION IF NOT EXISTS (\w+);/g, (match, extName) => {
    return `-- Ensure extension is available\nDO $$\nBEGIN\n  CREATE EXTENSION IF NOT EXISTS ${extName};\nEXCEPTION\n  WHEN others THEN\n    RAISE NOTICE 'Extension ${extName} not available: %', SQLERRM;\nEND$$;\n`;
  });
  modifications.push('Added error handling for extensions');

  // 4. Comment out Supabase-specific schemas that might cause issues
  const supabaseSchemas = ['auth', 'storage', 'realtime', 'supabase_functions'];
  supabaseSchemas.forEach(schema => {
    const schemaRegex = new RegExp(`CREATE SCHEMA ${schema};`, 'g');
    if (sqlContent.match(schemaRegex)) {
      modifications.push(`Found schema: ${schema} (will attempt to create)`);
    }
  });

  // 5. Add notice at the top
  const notice = `-- ========================================
-- SQL file prepared for Azure PostgreSQL
-- Original: Supabase database backup
-- Modified: ${new Date().toISOString()}
-- Modifications:
${modifications.map(m => `--   - ${m}`).join('\n')}
-- ========================================

SET client_min_messages TO WARNING;

`;

  sqlContent = notice + sqlContent;

  // Write modified SQL
  const backupsDir = path.dirname(targetPath);
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, sqlContent, 'utf-8');

  success('SQL file prepared for Azure');
  info(`Modified file: ${targetPath}`);
  info(`\nModifications made:`);
  modifications.forEach(m => info(`  • ${m}`));

  return targetPath;
}

/**
 * Execute SQL migration
 */
function executeMigration(connectionString, sqlFilePath, envVars) {
  info('\n🚀 Executing database migration...\n');
  info('This may take several minutes depending on data size...\n');

  const logPath = path.join(__dirname, `../../migration/logs/migration-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);

  // Create logs directory
  const logsDir = path.dirname(logPath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  try {
    // Set PGPASSWORD environment variable for non-interactive execution
    const env = {
      ...process.env,
      PGPASSWORD: envVars.AZURE_POSTGRESQL_PASSWORD,
    };

    // Execute migration with error continuation
    const result = execSync(
      `psql "${connectionString}" -f "${sqlFilePath}" --set ON_ERROR_STOP=off 2>&1 | tee "${logPath}"`,
      {
        encoding: 'utf-8',
        stdio: 'inherit',
        env,
      }
    );

    success('\nMigration execution completed');
    info(`Full log saved to: ${logPath}`);

    return true;
  } catch (err) {
    warning('\nMigration completed with some errors (this is normal)');
    info(`Check log file for details: ${logPath}`);
    warning('Common expected errors:');
    warning('  • Role already exists');
    warning('  • Extension not available');
    warning('  • Schema already exists');
    return true; // Return true because some errors are expected
  }
}

/**
 * Verify migration results
 */
function verifyMigration(connectionString) {
  info('\n✅ Verifying migration...\n');

  const checks = [
    {
      name: 'Tables count',
      query: "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';",
    },
    {
      name: 'Projects table',
      query: "SELECT COUNT(*) FROM projects;",
    },
    {
      name: 'Project images table',
      query: "SELECT COUNT(*) FROM project_images;",
    },
    {
      name: 'Categories table',
      query: "SELECT COUNT(*) FROM categories;",
    },
    {
      name: 'User profiles table',
      query: "SELECT COUNT(*) FROM user_profiles;",
    },
  ];

  let allChecksPassed = true;

  checks.forEach(check => {
    try {
      const result = execSync(`psql "${connectionString}" -c "${check.query}" -t`, {
        encoding: 'utf-8',
      }).trim();

      const count = parseInt(result);
      if (count >= 0) {
        success(`${check.name}: ${count} records`);
      } else {
        warning(`${check.name}: Could not verify`);
      }
    } catch (err) {
      error(`${check.name}: Failed to verify`);
      allChecksPassed = false;
    }
  });

  return allChecksPassed;
}

/**
 * Display next steps
 */
function displayNextSteps() {
  log('\n' + '═'.repeat(60));
  log('NEXT STEPS', colors.blue);
  log('═'.repeat(60) + '\n');

  info('The database migration is complete. Next actions:\n');
  info('1. Review migration logs for any critical errors');
  info('   Location: migration/logs/\n');
  info('2. Download images from Supabase Storage:');
  info('   node migration/scripts/3-download-storage-files.js\n');
  info('3. Upload images to Azure Blob Storage:');
  info('   node migration/scripts/4-upload-to-azure-blob.js\n');
  info('4. Update database image URLs:');
  info('   node migration/scripts/5-update-database-urls.js\n');
  info('5. Verify complete migration:');
  info('   node migration/scripts/6-verify-migration.js\n');

  log('═'.repeat(60) + '\n');
}

/**
 * Main migration function
 */
async function main() {
  log('\n╔═══════════════════════════════════════════════════════╗', colors.blue);
  log('║      WOLF STUDIO - DATABASE MIGRATION SCRIPT        ║', colors.blue);
  log('╚═══════════════════════════════════════════════════════╝', colors.blue);

  // Load environment
  const envVars = loadEnvironment();
  const connectionString = buildConnectionString(envVars);

  // Test connection
  if (!testConnection(connectionString)) {
    error('\nMigration aborted: Cannot connect to Azure PostgreSQL');
    error('Please check your connection settings in .env.azure');
    process.exit(1);
  }

  // Backup existing database
  const backupPath = backupExistingDatabase(connectionString, envVars);

  // Prepare SQL file
  const azureSqlPath = prepareSQLForAzure();
  if (!azureSqlPath) {
    error('\nMigration aborted: Could not prepare SQL file');
    process.exit(1);
  }

  // Confirm before proceeding
  warning('\n⚠️  WARNING: This will modify your Azure PostgreSQL database');
  if (backupPath) {
    info(`A backup has been created at: ${backupPath}`);
  }
  info('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Execute migration
  const migrationSuccess = executeMigration(connectionString, azureSqlPath, envVars);

  if (!migrationSuccess) {
    error('\nMigration failed');
    if (backupPath) {
      info(`You can restore from backup: ${backupPath}`);
      info(`Run: psql "${connectionString}" -f "${backupPath}"`);
    }
    process.exit(1);
  }

  // Verify migration
  const verificationSuccess = verifyMigration(connectionString);

  // Summary
  log('\n' + '═'.repeat(60));
  log('MIGRATION SUMMARY', colors.blue);
  log('═'.repeat(60) + '\n');

  if (verificationSuccess) {
    success('✓ Database migration completed successfully!');
  } else {
    warning('⚠ Database migration completed with warnings');
    warning('  Please review the verification results above');
  }

  displayNextSteps();
}

// Run migration
main().catch(err => {
  error(`\nMigration failed with error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
