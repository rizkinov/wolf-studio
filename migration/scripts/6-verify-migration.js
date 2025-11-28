#!/usr/bin/env node
/**
 * Step 6: Verify Complete Migration
 *
 * Comprehensive verification of the entire migration including
 * database, storage, and configuration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

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
 * Test URL accessibility
 */
function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Verify database schema
 */
function verifyDatabaseSchema(connectionString) {
  info('\n📋 Verifying database schema...\n');

  const requiredTables = [
    'projects',
    'project_images',
    'categories',
    'user_profiles',
    'activity_logs',
  ];

  const checks = [];

  for (const table of requiredTables) {
    try {
      const result = execSync(
        `psql "${connectionString}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '${table}' AND table_schema = 'public';"`,
        { encoding: 'utf-8' }
      ).trim();

      const exists = parseInt(result) > 0;

      if (exists) {
        success(`Table exists: ${table}`);
        checks.push({ table, exists: true });
      } else {
        error(`Table missing: ${table}`);
        checks.push({ table, exists: false });
      }
    } catch (err) {
      error(`Failed to check table: ${table}`);
      checks.push({ table, exists: false, error: err.message });
    }
  }

  const allTablesExist = checks.every(c => c.exists);
  return { allTablesExist, checks };
}

/**
 * Verify database data
 */
function verifyDatabaseData(connectionString) {
  info('\n📊 Verifying database data...\n');

  const dataChecks = [
    { name: 'projects', query: 'SELECT COUNT(*) FROM projects;' },
    { name: 'project_images', query: 'SELECT COUNT(*) FROM project_images;' },
    { name: 'categories', query: 'SELECT COUNT(*) FROM categories;' },
    { name: 'user_profiles', query: 'SELECT COUNT(*) FROM user_profiles;' },
  ];

  const results = {};
  let totalRecords = 0;

  for (const check of dataChecks) {
    try {
      const result = execSync(`psql "${connectionString}" -t -c "${check.query}"`, {
        encoding: 'utf-8',
      }).trim();

      const count = parseInt(result);
      results[check.name] = count;
      totalRecords += count;

      if (count > 0) {
        success(`${check.name}: ${count} records`);
      } else {
        warning(`${check.name}: 0 records (table is empty)`);
      }
    } catch (err) {
      error(`Failed to count ${check.name}`);
      results[check.name] = -1;
    }
  }

  info(`\nTotal records: ${totalRecords}`);

  return { results, totalRecords };
}

/**
 * Verify URLs point to Azure
 */
function verifyUrlMigration(connectionString, envVars) {
  info('\n🔗 Verifying URL migration...\n');

  const azureBlobUrl = `https://${envVars.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;

  const checks = [
    {
      name: 'Project images using Azure URLs',
      query: `SELECT COUNT(*) FROM project_images WHERE image_url LIKE '%${azureBlobUrl}%';`,
    },
    {
      name: 'Project images still using Supabase URLs',
      query: `SELECT COUNT(*) FROM project_images WHERE image_url LIKE '%supabase.co%';`,
    },
    {
      name: 'Projects with Azure banner images',
      query: `SELECT COUNT(*) FROM projects WHERE banner_image LIKE '%${azureBlobUrl}%';`,
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

      if (check.name.includes('still using Supabase')) {
        if (count === 0) {
          success(`${check.name}: ${count}`);
        } else {
          error(`${check.name}: ${count}`);
        }
      } else {
        if (count > 0) {
          success(`${check.name}: ${count}`);
        } else {
          warning(`${check.name}: ${count}`);
        }
      }
    } catch (err) {
      error(`Failed to check: ${check.name}`);
      results[check.name] = -1;
    }
  }

  return results;
}

/**
 * Test image accessibility
 */
async function testImageAccessibility(connectionString) {
  info('\n🖼️  Testing image accessibility...\n');

  try {
    const result = execSync(
      `psql "${connectionString}" -t -c "SELECT image_url FROM project_images WHERE image_url IS NOT NULL LIMIT 5;"`,
      { encoding: 'utf-8' }
    );

    const urls = result
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.startsWith('http'));

    if (urls.length === 0) {
      warning('No image URLs found to test');
      return { tested: 0, accessible: 0, failed: 0 };
    }

    info(`Testing ${urls.length} sample image URLs...`);

    let accessible = 0;
    let failed = 0;

    for (const url of urls) {
      const isAccessible = await testUrl(url);
      if (isAccessible) {
        accessible++;
        success(`  ✓ ${url.substring(0, 80)}...`);
      } else {
        failed++;
        error(`  ✗ ${url.substring(0, 80)}...`);
      }
    }

    return { tested: urls.length, accessible, failed };
  } catch (err) {
    error('Failed to test image accessibility');
    return { tested: 0, accessible: 0, failed: 0, error: err.message };
  }
}

/**
 * Verify RLS policies exist
 */
function verifyRLSPolicies(connectionString) {
  info('\n🔒 Checking Row Level Security policies...\n');

  try {
    const result = execSync(
      `psql "${connectionString}" -t -c "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';"`,
      { encoding: 'utf-8' }
    ).trim();

    const count = parseInt(result);

    if (count > 0) {
      success(`RLS policies found: ${count}`);
      warning('Note: RLS policies exist but may not enforce without Supabase Auth');
      warning('      Consider implementing application-level permissions');
    } else {
      warning('No RLS policies found');
    }

    return count;
  } catch (err) {
    warning('Could not check RLS policies');
    return -1;
  }
}

/**
 * Generate migration report
 */
function generateReport(data, reportDir) {
  const reportPath = path.join(reportDir, 'migration-verification-report.json');

  const report = {
    verificationDate: new Date().toISOString(),
    ...data,
    summary: {
      databaseSchemaValid: data.schemaVerification.allTablesExist,
      dataPresent: data.dataVerification.totalRecords > 0,
      urlsMigrated: data.urlVerification['Project images still using Supabase URLs'] === 0,
      imagesAccessible: data.imageAccessibility.failed === 0,
      overallStatus: 'unknown',
    },
  };

  // Determine overall status
  const { summary } = report;
  if (summary.databaseSchemaValid && summary.dataPresent && summary.urlsMigrated && summary.imagesAccessible) {
    summary.overallStatus = 'success';
  } else if (summary.databaseSchemaValid && summary.dataPresent) {
    summary.overallStatus = 'partial';
  } else {
    summary.overallStatus = 'failed';
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  success(`\nVerification report saved: ${reportPath}`);

  return report;
}

/**
 * Display final summary
 */
function displaySummary(report) {
  log('\n' + '═'.repeat(60));
  log('MIGRATION VERIFICATION SUMMARY', colors.blue);
  log('═'.repeat(60) + '\n');

  const { summary } = report;

  // Overall status
  if (summary.overallStatus === 'success') {
    success('✓ MIGRATION SUCCESSFUL');
  } else if (summary.overallStatus === 'partial') {
    warning('⚠ MIGRATION PARTIALLY COMPLETE');
  } else {
    error('✗ MIGRATION FAILED');
  }

  log('');

  // Checklist
  info('Migration Checklist:');
  log(`  ${summary.databaseSchemaValid ? '✓' : '✗'} Database schema migrated`);
  log(`  ${summary.dataPresent ? '✓' : '✗'} Data migrated`);
  log(`  ${summary.urlsMigrated ? '✓' : '✗'} URLs updated to Azure`);
  log(`  ${summary.imagesAccessible ? '✓' : '✗'} Images accessible`);

  log('');

  // Details
  info('Details:');
  info(`  • Total database records: ${report.dataVerification.totalRecords}`);
  info(`  • Images tested: ${report.imageAccessibility.tested}`);
  info(`  • Images accessible: ${report.imageAccessibility.accessible}`);
  info(`  • Images failed: ${report.imageAccessibility.failed}`);
  info(`  • RLS policies: ${report.rlsPolicies}`);

  log('\n' + '═'.repeat(60) + '\n');
}

/**
 * Display post-migration tasks
 */
function displayPostMigrationTasks() {
  info('POST-MIGRATION TASKS:\n');

  info('1. UPDATE APPLICATION CODE:');
  info('   • Implement Azure Blob Storage adapter (see migration/lib/azure-storage/)');
  info('   • Implement NextAuth.js with Azure AD B2C (see migration/lib/azure-auth/)');
  info('   • Update environment variables in production');
  info('   • Test authentication flow\n');

  info('2. UPDATE MIDDLEWARE:');
  info('   • Replace Supabase auth checks with NextAuth');
  info('   • Update RLS or implement application-level permissions\n');

  info('3. DEPLOY TO AZURE:');
  info('   • Deploy to Azure Static Web Apps or App Service');
  info('   • Configure environment variables');
  info('   • Test all features in production\n');

  info('4. CUTOVER:');
  info('   • Update DNS to point to Azure');
  info('   • Monitor error logs');
  info('   • Keep Supabase backup for 30 days\n');

  info('For detailed instructions, see: migration/docs/AZURE-MIGRATION-GUIDE.md\n');
}

/**
 * Main verification function
 */
async function main() {
  log('\n╔═══════════════════════════════════════════════════════╗', colors.blue);
  log('║   WOLF STUDIO - MIGRATION VERIFICATION SCRIPT       ║', colors.blue);
  log('╚═══════════════════════════════════════════════════════╝', colors.blue);

  // Load environment
  const envVars = loadEnvironment();
  const connectionString = buildConnectionString(envVars);

  // Run all verification checks
  const schemaVerification = verifyDatabaseSchema(connectionString);
  const dataVerification = verifyDatabaseData(connectionString);
  const urlVerification = verifyUrlMigration(connectionString, envVars);
  const imageAccessibility = await testImageAccessibility(connectionString);
  const rlsPolicies = verifyRLSPolicies(connectionString);

  // Generate report
  const reportDir = path.join(__dirname, '../../migration/reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = generateReport(
    {
      schemaVerification,
      dataVerification,
      urlVerification,
      imageAccessibility,
      rlsPolicies,
    },
    reportDir
  );

  // Display summary
  displaySummary(report);

  // Display post-migration tasks
  displayPostMigrationTasks();

  // Exit code based on status
  if (report.summary.overallStatus === 'success') {
    process.exit(0);
  } else if (report.summary.overallStatus === 'partial') {
    process.exit(2);
  } else {
    process.exit(1);
  }
}

// Run verification
main().catch(err => {
  error(`\nVerification failed with error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
