#!/usr/bin/env node
/**
 * Step 5: Update Database URLs
 *
 * Updates all Supabase Storage URLs in the database
 * to point to Azure Blob Storage URLs.
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
 * Load environment variables
 */
function loadEnvironment() {
  const envPath = path.join(__dirname, '../../.env.azure');

  if (!fs.existsSync(envPath)) {
    error('.env.azure file not found!');
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
 * Build PostgreSQL connection string
 */
function buildConnectionString(envVars) {
  const { AZURE_POSTGRESQL_USER, AZURE_POSTGRESQL_PASSWORD, AZURE_POSTGRESQL_HOST, AZURE_POSTGRESQL_PORT, AZURE_POSTGRESQL_DATABASE } = envVars;

  return `postgresql://${AZURE_POSTGRESQL_USER}:${encodeURIComponent(AZURE_POSTGRESQL_PASSWORD)}@${AZURE_POSTGRESQL_HOST}:${AZURE_POSTGRESQL_PORT}/${AZURE_POSTGRESQL_DATABASE}?sslmode=require`;
}

/**
 * Build Azure Blob Storage base URL
 */
function buildAzureBlobBaseUrl(envVars) {
  const accountName = envVars.AZURE_STORAGE_ACCOUNT_NAME;
  const containerName = envVars.AZURE_BLOB_CONTAINER_NAME || 'project-images';

  return `https://${accountName}.blob.core.windows.net/${containerName}`;
}

/**
 * Get Supabase URL from env or detect from database
 */
function getSupabaseUrl(connectionString, envVars) {
  // Try from environment first
  if (envVars.NEXT_PUBLIC_SUPABASE_URL) {
    return envVars.NEXT_PUBLIC_SUPABASE_URL;
  }

  // Try to detect from database
  try {
    const result = execSync(
      `psql "${connectionString}" -t -c "SELECT image_url FROM project_images LIMIT 1;"`,
      { encoding: 'utf-8' }
    ).trim();

    if (result && result.includes('supabase.co')) {
      const match = result.match(/(https:\/\/[^\/]+\.supabase\.co)/);
      if (match) {
        return match[1];
      }
    }
  } catch (err) {
    // Ignore errors
  }

  return null;
}

/**
 * Count URLs to update
 */
function countUrlsToUpdate(connectionString, supabaseUrl) {
  info('\n📊 Analyzing URLs in database...\n');

  const queries = {
    project_images: `SELECT COUNT(*) FROM project_images WHERE image_url LIKE '%${supabaseUrl}%';`,
    projects: `SELECT COUNT(*) FROM projects WHERE banner_image LIKE '%${supabaseUrl}%';`,
  };

  const counts = {};
  let total = 0;

  for (const [table, query] of Object.entries(queries)) {
    try {
      const result = execSync(`psql "${connectionString}" -t -c "${query}"`, {
        encoding: 'utf-8',
      }).trim();

      const count = parseInt(result);
      counts[table] = count;
      total += count;

      if (count > 0) {
        info(`${table}: ${count} URLs to update`);
      }
    } catch (err) {
      warning(`Could not count URLs in ${table}: ${err.message}`);
      counts[table] = 0;
    }
  }

  info(`\nTotal URLs to update: ${total}\n`);

  return { counts, total };
}

/**
 * Create backup before updating
 */
function createBackup(connectionString) {
  info('💾 Creating database backup before URL updates...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, `../../migration/backups/pre-url-update-${timestamp}.sql`);

  const backupsDir = path.dirname(backupPath);
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  try {
    execSync(`pg_dump "${connectionString}" -f "${backupPath}"`, {
      encoding: 'utf-8',
      stdio: 'inherit',
    });

    success(`Backup created: ${backupPath}`);
    return backupPath;
  } catch (err) {
    error('Failed to create backup');
    throw err;
  }
}

/**
 * Update URLs in database
 */
function updateUrls(connectionString, supabaseUrl, azureBlobUrl) {
  info('\n🔄 Updating URLs in database...\n');

  // Extract bucket name from Supabase URL pattern
  const supabaseStoragePattern = `${supabaseUrl}/storage/v1/object/public/`;

  const updates = [
    {
      table: 'project_images',
      column: 'image_url',
      query: `
        UPDATE project_images
        SET image_url = REPLACE(image_url, '${supabaseStoragePattern}', '${azureBlobUrl}/')
        WHERE image_url LIKE '%${supabaseUrl}%';
      `,
    },
    {
      table: 'projects',
      column: 'banner_image',
      query: `
        UPDATE projects
        SET banner_image = REPLACE(banner_image, '${supabaseStoragePattern}', '${azureBlobUrl}/')
        WHERE banner_image LIKE '%${supabaseUrl}%';
      `,
    },
  ];

  const results = {};

  for (const update of updates) {
    try {
      info(`Updating ${update.table}.${update.column}...`);

      const result = execSync(`psql "${connectionString}" -t -c "${update.query}"`, {
        encoding: 'utf-8',
      }).trim();

      // Parse result (format: "UPDATE N")
      const match = result.match(/UPDATE (\d+)/);
      const count = match ? parseInt(match[1]) : 0;

      results[update.table] = count;
      success(`  Updated ${count} rows in ${update.table}`);
    } catch (err) {
      error(`  Failed to update ${update.table}: ${err.message}`);
      results[update.table] = 0;
    }
  }

  return results;
}

/**
 * Verify URL updates
 */
function verifyUpdates(connectionString, azureBlobUrl) {
  info('\n✅ Verifying URL updates...\n');

  const checks = [
    {
      name: 'project_images with Azure URLs',
      query: `SELECT COUNT(*) FROM project_images WHERE image_url LIKE '%${azureBlobUrl}%';`,
    },
    {
      name: 'projects with Azure URLs',
      query: `SELECT COUNT(*) FROM projects WHERE banner_image LIKE '%${azureBlobUrl}%';`,
    },
    {
      name: 'Remaining Supabase URLs',
      query: `SELECT COUNT(*) FROM project_images WHERE image_url LIKE '%supabase.co%';`,
    },
  ];

  const results = {};

  for (const check of checks) {
    try {
      const result = execSync(`psql "${connectionString}" -t -c "${check.query}"`, {
        encoding: 'utf-8',
      }).trim();

      const count = parseInt(result);
      results[check.name] = count;

      if (check.name.includes('Remaining')) {
        if (count === 0) {
          success(`${check.name}: ${count}`);
        } else {
          warning(`${check.name}: ${count}`);
        }
      } else {
        info(`${check.name}: ${count}`);
      }
    } catch (err) {
      error(`Failed to verify ${check.name}`);
    }
  }

  return results;
}

/**
 * Save update report
 */
function saveReport(data, reportDir) {
  const reportPath = path.join(reportDir, 'url-update-report.json');

  const report = {
    updateDate: new Date().toISOString(),
    ...data,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  success(`\nUpdate report saved: ${reportPath}`);

  return report;
}

/**
 * Display summary
 */
function displaySummary(report) {
  log('\n' + '═'.repeat(60));
  log('URL UPDATE SUMMARY', colors.blue);
  log('═'.repeat(60) + '\n');

  info(`Source URL: ${report.supabaseUrl}`);
  info(`Target URL: ${report.azureBlobUrl}\n`);

  info('URLs updated:');
  Object.entries(report.updateResults).forEach(([table, count]) => {
    info(`  • ${table}: ${count} rows`);
  });

  info('\nVerification results:');
  Object.entries(report.verificationResults).forEach(([check, count]) => {
    info(`  • ${check}: ${count}`);
  });

  log('\n' + '═'.repeat(60) + '\n');
}

/**
 * Main update function
 */
async function main() {
  log('\n╔═══════════════════════════════════════════════════════╗', colors.blue);
  log('║    WOLF STUDIO - DATABASE URL UPDATE SCRIPT         ║', colors.blue);
  log('╚═══════════════════════════════════════════════════════╝', colors.blue);

  // Load environment
  const envVars = loadEnvironment();
  const connectionString = buildConnectionString(envVars);
  const azureBlobUrl = buildAzureBlobBaseUrl(envVars);

  info(`\nAzure Blob URL: ${azureBlobUrl}`);

  // Get Supabase URL
  const supabaseUrl = getSupabaseUrl(connectionString, envVars);

  if (!supabaseUrl) {
    error('\nCould not determine Supabase URL');
    error('Please set NEXT_PUBLIC_SUPABASE_URL in .env.azure');
    process.exit(1);
  }

  info(`Supabase URL: ${supabaseUrl}`);

  // Count URLs to update
  const { counts, total } = countUrlsToUpdate(connectionString, supabaseUrl);

  if (total === 0) {
    warning('\nNo Supabase URLs found in database');
    warning('URLs may already be updated, or database may be empty');
    process.exit(0);
  }

  // Create backup
  const backupPath = createBackup(connectionString);

  // Confirm before proceeding
  warning('\n⚠️  WARNING: This will update URLs in the database');
  info(`A backup has been created at: ${backupPath}`);
  info('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Update URLs
  const updateResults = updateUrls(connectionString, supabaseUrl, azureBlobUrl);

  // Verify updates
  const verificationResults = verifyUpdates(connectionString, azureBlobUrl);

  // Save report
  const reportDir = path.join(__dirname, '../../migration/reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = saveReport(
    {
      supabaseUrl,
      azureBlobUrl,
      initialCounts: counts,
      updateResults,
      verificationResults,
      backupPath,
    },
    reportDir
  );

  // Display summary
  displaySummary(report);

  // Next steps
  info('Next steps:\n');
  info('1. Verify URLs in Azure Portal:');
  info('   Check that images load correctly in the application');
  info('2. Run final migration verification:');
  info('   node migration/scripts/6-verify-migration.js\n');

  const remainingSupabaseUrls = verificationResults['Remaining Supabase URLs'];

  if (remainingSupabaseUrls > 0) {
    warning(`Warning: ${remainingSupabaseUrls} Supabase URLs remain in database`);
    warning('Review the database for missed URLs\n');
  } else {
    success('✓ All URLs successfully updated to Azure Blob Storage!\n');
  }
}

// Run update
main().catch(err => {
  error(`\nURL update failed with error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
