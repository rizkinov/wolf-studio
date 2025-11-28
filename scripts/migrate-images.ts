import { createClient } from '@supabase/supabase-js';
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

// Load environment variables
dotenv.config({ path: '.env.local' });

const streamPipeline = promisify(pipeline);

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const SUPABASE_BUCKET_NAME = 'project-images';
const AZURE_CONTAINER_NAME = 'project-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Supabase credentials missing in .env.local');
    process.exit(1);
}

if (!AZURE_STORAGE_CONNECTION_STRING) {
    console.warn('Warning: AZURE_STORAGE_CONNECTION_STRING is missing. The script will run in dry-run/download mode only.');
}

async function migrateImages() {
    console.log('🚀 Starting migration from Supabase to Azure...');

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Initialize Azure client (if available)
    let containerClient;
    if (AZURE_STORAGE_CONNECTION_STRING) {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);

        // Create container if it doesn't exist
        await containerClient.createIfNotExists({
            access: 'blob' // Public read access for images
        });
        console.log(`✅ Connected to Azure Container: ${AZURE_CONTAINER_NAME}`);
    }

    // List all files in Supabase bucket
    console.log('📋 Listing files from Supabase...');
    const { data: files, error } = await supabase.storage.from(SUPABASE_BUCKET_NAME).list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
        console.error('Error listing files:', error);
        return;
    }

    if (!files || files.length === 0) {
        console.log('No files found in Supabase bucket.');
        return;
    }

    console.log(`Found ${files.length} files.`);

    // Create a local temp directory for downloads
    const tempDir = path.join(__dirname, '../temp_migration');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Process each file
    for (const file of files) {
        if (file.name === '.emptyFolderPlaceholder') continue;

        console.log(`Processing: ${file.name}...`);

        try {
            // 1. Download from Supabase
            const { data: blob, error: downloadError } = await supabase.storage
                .from(SUPABASE_BUCKET_NAME)
                .download(file.name);

            if (downloadError) {
                console.error(`Failed to download ${file.name}:`, downloadError);
                continue;
            }

            // 2. Upload to Azure (if configured)
            if (containerClient && AZURE_STORAGE_CONNECTION_STRING) {
                const blockBlobClient = containerClient.getBlockBlobClient(file.name);
                const arrayBuffer = await blob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                await blockBlobClient.upload(buffer, buffer.length, {
                    blobHTTPHeaders: {
                        blobContentType: file.metadata?.mimetype || 'application/octet-stream'
                    }
                });
                console.log(`✅ Uploaded to Azure: ${file.name}`);
            } else {
                // Save locally if no Azure connection
                const buffer = Buffer.from(await blob.arrayBuffer());
                const localPath = path.join(tempDir, file.name);
                fs.writeFileSync(localPath, buffer);
                console.log(`💾 Saved locally: ${localPath}`);
            }

        } catch (err) {
            console.error(`Error processing ${file.name}:`, err);
        }
    }

    console.log('✨ Migration process completed.');
}

migrateImages().catch(console.error);
