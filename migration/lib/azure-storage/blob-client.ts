/**
 * Azure Blob Storage Client
 *
 * Drop-in replacement for Supabase Storage operations
 * using Azure Blob Storage.
 */

import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';

export interface AzureBlobConfig {
  connectionString: string;
  containerName: string;
  accountName: string;
}

export interface UploadResult {
  data: {
    path: string;
    publicUrl: string;
  } | null;
  error: Error | null;
}

export interface DownloadResult {
  data: Blob | null;
  error: Error | null;
}

export interface ListResult {
  data: Array<{
    name: string;
    metadata?: Record<string, string>;
    size: number;
  }> | null;
  error: Error | null;
}

export class AzureBlobStorageClient {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;
  private config: AzureBlobConfig;

  constructor(config: AzureBlobConfig) {
    this.config = config;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString);
    this.containerClient = this.blobServiceClient.getContainerClient(config.containerName);
  }

  /**
   * Upload a file to Azure Blob Storage
   *
   * @param path - The blob path (e.g., 'images/photo.jpg')
   * @param file - File or Blob to upload
   * @param options - Upload options
   */
  async upload(
    path: string,
    file: File | Blob | Buffer,
    options: {
      contentType?: string;
      cacheControl?: string;
      upsert?: boolean;
      metadata?: Record<string, string>;
    } = {}
  ): Promise<UploadResult> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(path);

      // Check if blob exists and upsert is false
      if (!options.upsert) {
        const exists = await blockBlobClient.exists();
        if (exists) {
          return {
            data: null,
            error: new Error('Blob already exists. Set upsert: true to overwrite.'),
          };
        }
      }

      // Convert File/Blob to Buffer if needed
      let data: Buffer;
      if (file instanceof Buffer) {
        data = file;
      } else {
        const arrayBuffer = await file.arrayBuffer();
        data = Buffer.from(arrayBuffer);
      }

      // Upload
      await blockBlobClient.upload(data, data.length, {
        blobHTTPHeaders: {
          blobContentType: options.contentType || file.type || 'application/octet-stream',
          blobCacheControl: options.cacheControl || 'public, max-age=31536000',
        },
        metadata: options.metadata,
      });

      // Build public URL
      const publicUrl = this.getPublicUrl(path);

      return {
        data: {
          path,
          publicUrl,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Upload failed'),
      };
    }
  }

  /**
   * Download a file from Azure Blob Storage
   *
   * @param path - The blob path
   */
  async download(path: string): Promise<DownloadResult> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(path);

      const downloadResponse = await blockBlobClient.download();

      if (!downloadResponse.readableStreamBody) {
        throw new Error('No data in download response');
      }

      // Convert stream to Blob
      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(Buffer.from(chunk));
      }

      const buffer = Buffer.concat(chunks);
      const blob = new Blob([buffer], {
        type: downloadResponse.contentType || 'application/octet-stream',
      });

      return {
        data: blob,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Download failed'),
      };
    }
  }

  /**
   * Delete a file from Azure Blob Storage
   *
   * @param path - The blob path or array of paths
   */
  async remove(paths: string | string[]): Promise<{ data: null; error: Error | null }> {
    try {
      const pathArray = Array.isArray(paths) ? paths : [paths];

      const deletePromises = pathArray.map(async (path) => {
        const blockBlobClient = this.containerClient.getBlockBlobClient(path);
        await blockBlobClient.delete();
      });

      await Promise.all(deletePromises);

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Delete failed'),
      };
    }
  }

  /**
   * List files in a directory
   *
   * @param path - Directory path (empty string for root)
   * @param options - List options
   */
  async list(
    path: string = '',
    options: {
      limit?: number;
      offset?: number;
      sortBy?: { column: string; order: 'asc' | 'desc' };
    } = {}
  ): Promise<ListResult> {
    try {
      const prefix = path ? `${path}/` : '';
      const blobs = this.containerClient.listBlobsFlat({ prefix });

      const results: Array<{
        name: string;
        metadata?: Record<string, string>;
        size: number;
      }> = [];

      for await (const blob of blobs) {
        // Remove prefix from name to match Supabase behavior
        const name = blob.name.replace(prefix, '');

        results.push({
          name,
          metadata: blob.metadata,
          size: blob.properties.contentLength || 0,
        });

        if (options.limit && results.length >= options.limit) {
          break;
        }
      }

      // Apply sorting if specified
      if (options.sortBy) {
        results.sort((a, b) => {
          const aVal = a[options.sortBy!.column as keyof typeof a];
          const bVal = b[options.sortBy!.column as keyof typeof b];

          if (options.sortBy!.order === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }

      return {
        data: results,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('List failed'),
      };
    }
  }

  /**
   * Get public URL for a blob
   *
   * @param path - The blob path
   */
  getPublicUrl(path: string): string {
    return `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}/${path}`;
  }

  /**
   * Check if a blob exists
   *
   * @param path - The blob path
   */
  async exists(path: string): Promise<boolean> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(path);
      return await blockBlobClient.exists();
    } catch {
      return false;
    }
  }

  /**
   * Move/rename a blob
   *
   * @param fromPath - Source path
   * @param toPath - Destination path
   */
  async move(fromPath: string, toPath: string): Promise<{ data: null; error: Error | null }> {
    try {
      const sourceClient = this.containerClient.getBlockBlobClient(fromPath);
      const destClient = this.containerClient.getBlockBlobClient(toPath);

      // Copy to new location
      await destClient.beginCopyFromURL(sourceClient.url);

      // Delete original
      await sourceClient.delete();

      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Move failed'),
      };
    }
  }

  /**
   * Create a signed URL for temporary access
   *
   * @param path - The blob path
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   */
  async createSignedUrl(
    path: string,
    expiresIn: number = 3600
  ): Promise<{ data: { signedUrl: string } | null; error: Error | null }> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(path);

      // Note: For production, implement SAS token generation
      // This requires additional Azure SDK packages
      // For now, return public URL
      const publicUrl = this.getPublicUrl(path);

      return {
        data: { signedUrl: publicUrl },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Failed to create signed URL'),
      };
    }
  }
}

/**
 * Create Azure Blob Storage client instance
 */
export function createAzureBlobClient(config: AzureBlobConfig): AzureBlobStorageClient {
  return new AzureBlobStorageClient(config);
}
