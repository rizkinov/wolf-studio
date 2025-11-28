#!/usr/bin/env node
/**
 * Step 4: Upload Files to Azure Blob Storage
 *
 * Uploads all downloaded files from Supabase Storage
 * to Azure Blob Storage with proper structure and metadata.
 */

const fs = require('fs');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');

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
    error('Create .env.azure with Azure Storage credentials');
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
 * Initialize Azure Blob Service Client
 */
function initAzureBlobClient(envVars) {
  const connectionString = envVars.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString) {
    error('AZURE_STORAGE_CONNECTION_STRING not found in .env.azure');
    process.exit(1);
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    return blobServiceClient;
  } catch (err) {
    error(`Failed to initialize Azure Blob client: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Create container if it doesn't exist
 */
async function ensureContainer(blobServiceClient, containerName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);

  try {
    const exists = await containerClient.exists();

    if (!exists) {
      info(`Creating container: ${containerName}`);
      await containerClient.create({
        access: 'blob', // Public read access for blobs
      });
      success(`Container created: ${containerName}`);
    } else {
      success(`Container exists: ${containerName}`);
    }

    return containerClient;
  } catch (err) {
    error(`Failed to create/access container ${containerName}: ${err.message}`);
    throw err;
  }
}

/**
 * Upload a single file to Azure Blob Storage
 */
async function uploadFile(containerClient, localPath, blobName, contentType) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    // Check if blob already exists
    const exists = await blockBlobClient.exists();

    if (exists) {
      // Get local file size
      const stats = fs.statSync(localPath);
      const localSize = stats.size;

      // Get blob properties
      const properties = await blockBlobClient.getProperties();
      const blobSize = properties.contentLength;

      // Skip if same size
      if (localSize === blobSize) {
        return { status: 'skipped', reason: 'already exists' };
      }
    }

    // Upload file
    const data = fs.readFileSync(localPath);

    await blockBlobClient.upload(data, data.length, {
      blobHTTPHeaders: {
        blobContentType: contentType || 'application/octet-stream',
        blobCacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    return { status: 'uploaded', url: blockBlobClient.url };
  } catch (err) {
    return { status: 'failed', error: err.message };
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Upload files from a bucket directory
 */
async function uploadBucketFiles(containerClient, bucketDir, bucketName) {
  info(`\nUploading files from ${bucketName}...`);

  const files = [];

  // Recursively find all files
  function findFiles(dir, relativePath = '') {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relPath = relativePath ? `${relativePath}/${item}` : item;
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        findFiles(fullPath, relPath);
      } else {
        files.push({
          localPath: fullPath,
          blobName: relPath,
          size: stat.size,
        });
      }
    }
  }

  if (!fs.existsSync(bucketDir)) {
    warning(`Directory not found: ${bucketDir}`);
    return { uploaded: 0, skipped: 0, failed: 0 };
  }

  findFiles(bucketDir);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  let totalSize = 0;

  for (const file of files) {
    const contentType = getMimeType(file.blobName);
    const result = await uploadFile(containerClient, file.localPath, file.blobName, contentType);

    if (result.status === 'uploaded') {
      uploaded++;
      totalSize += file.size;
    } else if (result.status === 'skipped') {
      skipped++;
    } else {
      failed++;
      warning(`  Failed: ${file.blobName} - ${result.error}`);
    }

    // Progress indicator
    const processed = uploaded + skipped + failed;
    if (processed % 10 === 0 || processed === files.length) {
      process.stdout.write(`\r  Progress: ${processed}/${files.length} files`);
    }
  }

  console.log(''); // New line after progress

  return { uploaded, skipped, failed, totalSize };
}

/**
 * Save upload manifest
 */
function saveManifest(results, containerName, uploadDir) {
  const manifestPath = path.join(uploadDir, 'upload-manifest.json');

  const manifest = {
    uploadDate: new Date().toISOString(),
    containerName,
    buckets: results,
    totals: {
      uploaded: Object.values(results).reduce((sum, r) => sum + r.uploaded, 0),
      skipped: Object.values(results).reduce((sum, r) => sum + r.skipped, 0),
      failed: Object.values(results).reduce((sum, r) => sum + r.failed, 0),
      totalSize: Object.values(results).reduce((sum, r) => sum + r.totalSize, 0),
    },
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  success(`Upload manifest saved: ${manifestPath}`);

  return manifest;
}

/**
 * Display upload summary
 */
function displaySummary(manifest) {
  log('\n' + '═'.repeat(60));
  log('UPLOAD SUMMARY', colors.blue);
  log('═'.repeat(60) + '\n');

  info(`Container: ${manifest.containerName}`);
  info(`Total uploaded: ${manifest.totals.uploaded}`);
  info(`Total skipped: ${manifest.totals.skipped}`);
  info(`Total failed: ${manifest.totals.failed}`);

  const sizeMB = (manifest.totals.totalSize / 1024 / 1024).toFixed(2);
  info(`Total size: ${sizeMB} MB\n`);

  info('Results by bucket:');
  Object.entries(manifest.buckets).forEach(([bucket, stats]) => {
    const bucketSizeMB = (stats.totalSize / 1024 / 1024).toFixed(2);
    info(`  • ${bucket}:`);
    info(`    - Uploaded: ${stats.uploaded}`);
    info(`    - Skipped: ${stats.skipped}`);
    info(`    - Failed: ${stats.failed}`);
    info(`    - Size: ${bucketSizeMB} MB`);
  });

  log('\n' + '═'.repeat(60) + '\n');
}

/**
 * Main upload function
 */
async function main() {
  log('\n╔═══════════════════════════════════════════════════════╗', colors.blue);
  log('║    WOLF STUDIO - AZURE BLOB UPLOAD SCRIPT           ║', colors.blue);
  log('╚═══════════════════════════════════════════════════════╝', colors.blue);

  // Load environment
  const envVars = loadEnvironment();

  // Initialize Azure Blob client
  info('\n☁️  Connecting to Azure Blob Storage...\n');
  const blobServiceClient = initAzureBlobClient(envVars);
  success('Connected to Azure Blob Storage');

  // Get container name
  const containerName = envVars.AZURE_BLOB_CONTAINER_NAME || 'project-images';
  info(`Target container: ${containerName}`);

  // Ensure container exists
  const containerClient = await ensureContainer(blobServiceClient, containerName);

  // Get download directory
  const downloadDir = path.join(__dirname, '../../migration/downloads/supabase-storage');

  if (!fs.existsSync(downloadDir)) {
    error(`Download directory not found: ${downloadDir}`);
    error('Run step 3 (download-storage-files.js) first');
    process.exit(1);
  }

  // Get list of bucket directories
  const buckets = fs.readdirSync(downloadDir).filter(item => {
    const fullPath = path.join(downloadDir, item);
    return fs.statSync(fullPath).isDirectory();
  });

  if (buckets.length === 0) {
    error('No bucket directories found in download directory');
    error('Run step 3 (download-storage-files.js) first');
    process.exit(1);
  }

  info(`\n📦 Found ${buckets.length} bucket(s) to upload: ${buckets.join(', ')}\n`);

  const results = {};

  // Upload from each bucket
  for (const bucket of buckets) {
    log(`\n${'─'.repeat(60)}`);
    log(`Processing bucket: ${bucket}`, colors.cyan);
    log('─'.repeat(60));

    const bucketDir = path.join(downloadDir, bucket);
    const stats = await uploadBucketFiles(containerClient, bucketDir, bucket);

    results[bucket] = stats;

    success(`\n${bucket}: ${stats.uploaded} uploaded, ${stats.skipped} skipped, ${stats.failed} failed`);
  }

  // Save manifest
  info('\n📝 Saving upload manifest...');
  const uploadDir = path.join(__dirname, '../../migration/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const manifest = saveManifest(results, containerName, uploadDir);

  // Display summary
  displaySummary(manifest);

  // Next steps
  info('Next steps:\n');
  info('1. Verify uploaded files in Azure Portal:');
  info(`   Storage Account → Containers → ${containerName}`);
  info('2. Update database URLs to point to Azure Blob Storage:');
  info('   node migration/scripts/5-update-database-urls.js\n');

  const totalFailed = manifest.totals.failed;

  if (totalFailed > 0) {
    warning(`Warning: ${totalFailed} files failed to upload`);
    warning('Review the errors above and retry if necessary\n');
    process.exit(1);
  }

  success('✓ Azure Blob upload completed successfully!\n');
}

// Run upload
main().catch(err => {
  error(`\nUpload failed with error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
