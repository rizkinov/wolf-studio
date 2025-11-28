#!/usr/bin/env node
/**
 * Step 1: Environment Validation Script
 *
 * Validates that all required environment variables and Azure services
 * are properly configured before starting the migration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for pretty output
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

// Required environment variables for Azure
const REQUIRED_AZURE_ENV = {
  // Azure PostgreSQL
  AZURE_POSTGRESQL_HOST: 'Azure PostgreSQL server hostname (e.g., myserver.postgres.database.azure.com)',
  AZURE_POSTGRESQL_PORT: 'PostgreSQL port (usually 5432)',
  AZURE_POSTGRESQL_DATABASE: 'Database name',
  AZURE_POSTGRESQL_USER: 'Admin username',
  AZURE_POSTGRESQL_PASSWORD: 'Admin password',

  // Azure Blob Storage
  AZURE_STORAGE_ACCOUNT_NAME: 'Azure Storage account name',
  AZURE_STORAGE_ACCOUNT_KEY: 'Azure Storage account key',
  AZURE_STORAGE_CONNECTION_STRING: 'Azure Storage connection string',
  AZURE_BLOB_CONTAINER_NAME: 'Blob container for project images (default: project-images)',

  // Azure AD B2C (for authentication)
  AZURE_AD_B2C_TENANT_NAME: 'Azure AD B2C tenant name',
  AZURE_AD_B2C_CLIENT_ID: 'Application (client) ID',
  AZURE_AD_B2C_CLIENT_SECRET: 'Client secret value',
  AZURE_AD_B2C_PRIMARY_USER_FLOW: 'Primary user flow (e.g., B2C_1_signupsignin)',

  // Application URLs
  NEXT_PUBLIC_APP_URL: 'Application URL (e.g., https://yourapp.azurestaticapps.net)',
  NEXTAUTH_URL: 'NextAuth URL (same as app URL)',
  NEXTAUTH_SECRET: 'NextAuth secret (generate with: openssl rand -base64 32)',
};

// Required Supabase environment variables (for migration source)
const REQUIRED_SUPABASE_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key (for storage download)',
  SUPABASE_DB_PASSWORD: 'Supabase database password (if dumping fresh data)',
};

/**
 * Check if required tools are installed
 */
function checkRequiredTools() {
  info('\n📋 Checking required tools...\n');

  const tools = {
    node: { cmd: 'node --version', name: 'Node.js' },
    npm: { cmd: 'npm --version', name: 'npm' },
    psql: { cmd: 'psql --version', name: 'PostgreSQL client (psql)' },
  };

  let allToolsInstalled = true;

  for (const [key, tool] of Object.entries(tools)) {
    try {
      const version = execSync(tool.cmd, { encoding: 'utf-8' }).trim();
      success(`${tool.name}: ${version}`);
    } catch (err) {
      error(`${tool.name} is not installed or not in PATH`);
      allToolsInstalled = false;
    }
  }

  return allToolsInstalled;
}

/**
 * Load and validate environment variables
 */
function validateEnvironmentVariables() {
  info('\n🔐 Validating environment variables...\n');

  // Try to load .env.azure file
  const envPath = path.join(__dirname, '../../.env.azure');
  if (!fs.existsSync(envPath)) {
    error('.env.azure file not found!');
    info(`Create .env.azure file in project root using the template at: migration/config/.env.azure.template`);
    return false;
  }

  success('.env.azure file found');

  // Load environment variables from .env.azure
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      envVars[key.trim()] = value.trim();
    }
  });

  // Validate Azure environment variables
  let allAzureVarsPresent = true;
  info('\nAzure Configuration:');

  for (const [key, description] of Object.entries(REQUIRED_AZURE_ENV)) {
    if (envVars[key] && envVars[key] !== '' && !envVars[key].startsWith('your-')) {
      success(`${key}: Set`);
    } else {
      error(`${key}: Missing or not configured`);
      info(`  Description: ${description}`);
      allAzureVarsPresent = false;
    }
  }

  // Validate Supabase environment variables
  let allSupabaseVarsPresent = true;
  info('\nSupabase Configuration (Source):');

  for (const [key, description] of Object.entries(REQUIRED_SUPABASE_ENV)) {
    if (envVars[key] && envVars[key] !== '') {
      success(`${key}: Set`);
    } else {
      warning(`${key}: Missing`);
      info(`  Description: ${description}`);
      if (key !== 'SUPABASE_DB_PASSWORD') {
        allSupabaseVarsPresent = false;
      }
    }
  }

  return allAzureVarsPresent && allSupabaseVarsPresent;
}

/**
 * Check if required files exist
 */
function checkRequiredFiles() {
  info('\n📁 Checking required files...\n');

  const requiredFiles = {
    'supabase/backups/backup.sql': 'Database backup SQL file',
  };

  let allFilesExist = true;

  for (const [file, description] of Object.entries(requiredFiles)) {
    const filePath = path.join(__dirname, '../../', file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
      success(`${file} (${sizeInMB} MB)`);
    } else {
      error(`${file} not found`);
      info(`  Description: ${description}`);
      allFilesExist = false;
    }
  }

  return allFilesExist;
}

/**
 * Test Azure PostgreSQL connection
 */
function testAzurePostgreSQLConnection(envVars) {
  info('\n🔌 Testing Azure PostgreSQL connection...\n');

  try {
    const connectionString = `postgresql://${envVars.AZURE_POSTGRESQL_USER}:${envVars.AZURE_POSTGRESQL_PASSWORD}@${envVars.AZURE_POSTGRESQL_HOST}:${envVars.AZURE_POSTGRESQL_PORT}/${envVars.AZURE_POSTGRESQL_DATABASE}?sslmode=require`;

    // Test connection
    execSync(`psql "${connectionString}" -c "SELECT version();"`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    success('Azure PostgreSQL connection successful');
    return true;
  } catch (err) {
    error('Azure PostgreSQL connection failed');
    info(`Error: ${err.message}`);
    warning('Please verify:');
    warning('  1. Azure PostgreSQL server is running');
    warning('  2. Firewall rules allow your IP address');
    warning('  3. Credentials are correct');
    warning('  4. SSL is enabled (required for Azure PostgreSQL)');
    return false;
  }
}

/**
 * Check Azure Blob Storage connectivity
 */
function checkAzureBlobStorage(envVars) {
  info('\n☁️  Checking Azure Blob Storage setup...\n');

  if (!envVars.AZURE_STORAGE_CONNECTION_STRING || !envVars.AZURE_BLOB_CONTAINER_NAME) {
    error('Azure Blob Storage not fully configured');
    return false;
  }

  success('Azure Blob Storage credentials present');
  warning('Note: Actual connectivity will be tested during storage migration');

  return true;
}

/**
 * Generate migration checklist
 */
function generateChecklist() {
  info('\n📝 Pre-Migration Checklist:\n');

  const checklist = [
    'Backup current Supabase database (✓ backup.sql exists)',
    'Download all images from Supabase Storage (use script 3)',
    'Create Azure PostgreSQL Flexible Server',
    'Create Azure Storage Account and Blob container',
    'Configure Azure AD B2C tenant and app registration',
    'Set up all environment variables in .env.azure',
    'Install required Node.js packages: npm install',
    'Review and understand rollback procedures',
    'Schedule maintenance window for migration',
    'Notify users of planned downtime (if applicable)',
  ];

  checklist.forEach((item, index) => {
    log(`  ${index + 1}. ${item}`);
  });
}

/**
 * Main validation function
 */
async function main() {
  log('\n╔═══════════════════════════════════════════════════════╗', colors.blue);
  log('║   WOLF STUDIO - AZURE MIGRATION VALIDATION SCRIPT   ║', colors.blue);
  log('╚═══════════════════════════════════════════════════════╝', colors.blue);

  const checks = [];

  // Run all validation checks
  checks.push({ name: 'Required Tools', result: checkRequiredTools() });
  checks.push({ name: 'Environment Variables', result: validateEnvironmentVariables() });
  checks.push({ name: 'Required Files', result: checkRequiredFiles() });

  // Load environment variables for connection tests
  const envPath = path.join(__dirname, '../../.env.azure');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        envVars[key.trim()] = value.trim();
      }
    });

    checks.push({ name: 'Azure PostgreSQL Connection', result: testAzurePostgreSQLConnection(envVars) });
    checks.push({ name: 'Azure Blob Storage Setup', result: checkAzureBlobStorage(envVars) });
  }

  // Summary
  log('\n' + '═'.repeat(60));
  log('VALIDATION SUMMARY', colors.blue);
  log('═'.repeat(60) + '\n');

  const passedChecks = checks.filter(c => c.result).length;
  const totalChecks = checks.length;

  checks.forEach(check => {
    if (check.result) {
      success(check.name);
    } else {
      error(check.name);
    }
  });

  log('');

  if (passedChecks === totalChecks) {
    success(`All ${totalChecks} validation checks passed! ✓`);
    log('');
    success('✓ You are ready to proceed with the migration!');
    log('');
    info('Next steps:');
    info('  1. Review the migration guide: migration/docs/AZURE-MIGRATION-GUIDE.md');
    info('  2. Run database migration: node migration/scripts/2-migrate-database.js');
    log('');
  } else {
    error(`${totalChecks - passedChecks} of ${totalChecks} checks failed`);
    log('');
    warning('Please fix the issues above before proceeding with migration.');
    log('');
  }

  generateChecklist();

  log('\n' + '═'.repeat(60) + '\n');

  process.exit(passedChecks === totalChecks ? 0 : 1);
}

// Run validation
main().catch(err => {
  error(`Validation failed with error: ${err.message}`);
  process.exit(1);
});
