#!/usr/bin/env node
/**
 * Step 3: Download Storage Files from Supabase
 *
 * Downloads all images and files from Supabase Storage
 * to prepare for upload to Azure Blob Storage.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

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
  // Try .env.azure first, then fall back to .env.local
  let envPath = path.join(__dirname, '../../.env.azure');

  if (!fs.existsSync(envPath)) {
    envPath = path.join(__dirname, '../../.env.local');
  }

  if (!fs.existsSync(envPath)) {
    error('Neither .env.azure nor .env.local found!');
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
 * Initialize Supabase client
 */
function initSupabaseClient(envVars) {
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    error('Supabase credentials not found in environment');
    error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Download file from URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Get all files from a Supabase Storage bucket
 */
async function listBucketFiles(supabase, bucketName) {
  info(`Listing files in bucket: ${bucketName}`);

  try {
    const { data, error } = await supabase.storage.from(bucketName).list('', {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw error;
    }

    // Recursively get all files including subdirectories
    const allFiles = [];

    async function listRecursive(folder = '') {
      const { data: items, error } = await supabase.storage
        .from(bucketName)
        .list(folder, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        warning(`Error listing folder ${folder}: ${error.message}`);
        return;
      }

      for (const item of items) {
        const itemPath = folder ? `${folder}/${item.name}` : item.name;

        if (item.id === null) {
          // This is a folder, recurse into it
          await listRecursive(itemPath);
        } else {
          // This is a file
          allFiles.push({
            name: item.name,
            path: itemPath,
            size: item.metadata?.size || 0,
            bucket: bucketName,
          });
        }
      }
    }

    await listRecursive();

    success(`Found ${allFiles.length} files in ${bucketName}`);
    return allFiles;
  } catch (err) {
    error(`Failed to list files in ${bucketName}: ${err.message}`);
    return [];
  }
}

/**
 * Download all files from a bucket
 */
async function downloadBucketFiles(supabase, bucketName, files, downloadDir) {
  info(`\nDownloading ${files.length} files from ${bucketName}...`);

  const bucketDownloadDir = path.join(downloadDir, bucketName);

  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  for (const file of files) {
    const destPath = path.join(bucketDownloadDir, file.path);
    const destDir = path.dirname(destPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Skip if file already exists
    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      if (stats.size === file.size) {
        skipped++;
        continue;
      }
    }

    try {
      // Get public URL
      const { data } = supabase.storage.from(bucketName).getPublicUrl(file.path);

      if (!data || !data.publicUrl) {
        throw new Error('Could not get public URL');
      }

      // Download file
      await downloadFile(data.publicUrl, destPath);
      downloaded++;

      // Progress indicator
      if (downloaded % 10 === 0 || downloaded === files.length) {
        process.stdout.write(`\r  Progress: ${downloaded + skipped}/${files.length} files`);
      }
    } catch (err) {
      failed++;
      warning(`\n  Failed to download ${file.path}: ${err.message}`);
    }
  }

  console.log(''); // New line after progress

  return { downloaded, failed, skipped };
}

/**
 * Save download manifest
 */
function saveManifest(files, downloadDir) {
  const manifestPath = path.join(downloadDir, 'download-manifest.json');

  const manifest = {
    downloadDate: new Date().toISOString(),
    totalFiles: files.length,
    buckets: {},
  };

  // Group by bucket
  files.forEach(file => {
    if (!manifest.buckets[file.bucket]) {
      manifest.buckets[file.bucket] = {
        files: [],
        totalSize: 0,
      };
    }

    manifest.buckets[file.bucket].files.push({
      path: file.path,
      size: file.size,
    });

    manifest.buckets[file.bucket].totalSize += file.size;
  });

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  success(`Download manifest saved: ${manifestPath}`);

  return manifest;
}

/**
 * Display download summary
 */
function displaySummary(manifest, stats) {
  log('\n' + '═'.repeat(60));
  log('DOWNLOAD SUMMARY', colors.blue);
  log('═'.repeat(60) + '\n');

  info(`Total files in manifest: ${manifest.totalFiles}`);
  info(`Downloaded: ${stats.downloaded}`);
  info(`Skipped (already exists): ${stats.skipped}`);
  info(`Failed: ${stats.failed}\n`);

  info('Files by bucket:');
  Object.entries(manifest.buckets).forEach(([bucket, data]) => {
    const sizeMB = (data.totalSize / 1024 / 1024).toFixed(2);
    info(`  • ${bucket}: ${data.files.length} files (${sizeMB} MB)`);
  });

  log('\n' + '═'.repeat(60) + '\n');
}

/**
 * Main download function
 */
async function main() {
  log('\n╔═══════════════════════════════════════════════════════╗', colors.blue);
  log('║    WOLF STUDIO - STORAGE DOWNLOAD SCRIPT            ║', colors.blue);
  log('╚═══════════════════════════════════════════════════════╝', colors.blue);

  // Load environment
  const envVars = loadEnvironment();

  // Initialize Supabase client
  info('\n🔌 Connecting to Supabase...\n');
  const supabase = initSupabaseClient(envVars);
  success('Connected to Supabase');

  // Create download directory
  const downloadDir = path.join(__dirname, '../../migration/downloads/supabase-storage');
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }
  info(`Download directory: ${downloadDir}`);

  // Get list of buckets to download
  const bucketsToDownload = ['project-images', 'project-images-temp', 'business-cards'];

  info(`\n📦 Buckets to download: ${bucketsToDownload.join(', ')}\n`);

  const allFiles = [];
  let totalDownloaded = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  // Download from each bucket
  for (const bucket of bucketsToDownload) {
    log(`\n${'─'.repeat(60)}`);
    log(`Processing bucket: ${bucket}`, colors.cyan);
    log('─'.repeat(60) + '\n');

    const files = await listBucketFiles(supabase, bucket);

    if (files.length === 0) {
      warning(`No files found in ${bucket}, skipping...`);
      continue;
    }

    allFiles.push(...files);

    const stats = await downloadBucketFiles(supabase, bucket, files, downloadDir);
    totalDownloaded += stats.downloaded;
    totalFailed += stats.failed;
    totalSkipped += stats.skipped;

    success(`\n${bucket}: ${stats.downloaded} downloaded, ${stats.skipped} skipped, ${stats.failed} failed`);
  }

  // Save manifest
  info('\n📝 Saving download manifest...');
  const manifest = saveManifest(allFiles, downloadDir);

  // Display summary
  displaySummary(manifest, {
    downloaded: totalDownloaded,
    failed: totalFailed,
    skipped: totalSkipped,
  });

  // Next steps
  info('Next steps:\n');
  info('1. Review downloaded files in: migration/downloads/supabase-storage/');
  info('2. Upload to Azure Blob Storage:');
  info('   node migration/scripts/4-upload-to-azure-blob.js\n');

  if (totalFailed > 0) {
    warning(`Warning: ${totalFailed} files failed to download`);
    warning('Review the errors above and retry if necessary\n');
    process.exit(1);
  }

  success('✓ Storage download completed successfully!\n');
}

// Run download
main().catch(err => {
  error(`\nDownload failed with error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
