/**
 * Storage Adapter
 *
 * Provides a unified interface that works with both
 * Supabase Storage and Azure Blob Storage.
 */

import { AzureBlobStorageClient, AzureBlobConfig, UploadResult, DownloadResult, ListResult } from './blob-client';

export type StorageProvider = 'supabase' | 'azure';

export interface StorageConfig {
  provider: StorageProvider;
  azure?: AzureBlobConfig;
  supabase?: {
    url: string;
    key: string;
    bucket: string;
  };
}

export interface StorageAdapter {
  upload(path: string, file: File | Blob | Buffer, options?: any): Promise<UploadResult>;
  download(path: string): Promise<DownloadResult>;
  remove(paths: string | string[]): Promise<{ data: null; error: Error | null }>;
  list(path?: string, options?: any): Promise<ListResult>;
  getPublicUrl(path: string): string;
  exists(path: string): Promise<boolean>;
}

/**
 * Create a storage adapter based on configuration
 */
export function createStorageAdapter(config: StorageConfig): StorageAdapter {
  if (config.provider === 'azure') {
    if (!config.azure) {
      throw new Error('Azure configuration is required when provider is "azure"');
    }

    const azureClient = new AzureBlobStorageClient(config.azure);

    return {
      upload: (path, file, options) => azureClient.upload(path, file, options),
      download: (path) => azureClient.download(path),
      remove: (paths) => azureClient.remove(paths),
      list: (path, options) => azureClient.list(path, options),
      getPublicUrl: (path) => azureClient.getPublicUrl(path),
      exists: (path) => azureClient.exists(path),
    };
  }

  // Supabase implementation would go here
  // For migration purposes, we're focusing on Azure
  throw new Error('Supabase provider not implemented in this migration toolkit');
}

/**
 * Get storage configuration from environment variables
 */
export function getStorageConfigFromEnv(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER as StorageProvider) || 'azure';

  if (provider === 'azure') {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_BLOB_CONTAINER_NAME || 'project-images';
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

    if (!connectionString || !accountName) {
      throw new Error('Azure Storage configuration missing in environment variables');
    }

    return {
      provider: 'azure',
      azure: {
        connectionString,
        containerName,
        accountName,
      },
    };
  }

  throw new Error(`Unsupported storage provider: ${provider}`);
}

/**
 * Example usage in your application:
 *
 * ```typescript
 * // In lib/storage/client.ts
 * import { createStorageAdapter, getStorageConfigFromEnv } from '@/migration/lib/azure-storage/storage-adapter';
 *
 * const config = getStorageConfigFromEnv();
 * export const storage = createStorageAdapter(config);
 *
 * // In your components/services
 * import { storage } from '@/lib/storage/client';
 *
 * // Upload file
 * const result = await storage.upload('images/photo.jpg', file, {
 *   contentType: 'image/jpeg',
 *   cacheControl: 'public, max-age=31536000',
 * });
 *
 * // Get public URL
 * const url = storage.getPublicUrl('images/photo.jpg');
 *
 * // List files
 * const files = await storage.list('images/', { limit: 100 });
 *
 * // Delete file
 * await storage.remove('images/photo.jpg');
 * ```
 */
