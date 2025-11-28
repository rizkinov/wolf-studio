# Azure Blob Storage Adapter

This library provides a drop-in replacement for Supabase Storage using Azure Blob Storage.

## Features

- **Compatible API**: Matches Supabase Storage API for easy migration
- **TypeScript**: Full type safety
- **Flexible**: Works with File, Blob, or Buffer
- **Optimized**: Built-in caching and content-type handling

## Installation

```bash
npm install @azure/storage-blob
```

## Quick Start

### 1. Set Environment Variables

Add to your `.env.azure`:

```env
STORAGE_PROVIDER=azure
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_ACCOUNT_NAME=your-account-name
AZURE_BLOB_CONTAINER_NAME=project-images
```

### 2. Create Storage Client

Create `lib/storage/client.ts`:

```typescript
import { createStorageAdapter, getStorageConfigFromEnv } from '@/migration/lib/azure-storage/storage-adapter';

const config = getStorageConfigFromEnv();
export const storage = createStorageAdapter(config);
```

### 3. Use in Your Application

```typescript
import { storage } from '@/lib/storage/client';

// Upload a file
const handleUpload = async (file: File) => {
  const { data, error } = await storage.upload(
    `images/${file.name}`,
    file,
    {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000',
      upsert: false, // Prevent overwriting
    }
  );

  if (error) {
    console.error('Upload failed:', error);
    return;
  }

  console.log('File uploaded:', data.publicUrl);
};

// Get public URL
const imageUrl = storage.getPublicUrl('images/photo.jpg');

// List files
const { data: files } = await storage.list('images/', {
  limit: 100,
  sortBy: { column: 'name', order: 'asc' },
});

// Delete file
await storage.remove('images/photo.jpg');

// Delete multiple files
await storage.remove(['images/photo1.jpg', 'images/photo2.jpg']);

// Check if file exists
const exists = await storage.exists('images/photo.jpg');
```

## API Reference

### `upload(path, file, options)`

Upload a file to Azure Blob Storage.

**Parameters:**
- `path` (string): The blob path (e.g., 'images/photo.jpg')
- `file` (File | Blob | Buffer): File to upload
- `options` (object, optional):
  - `contentType` (string): MIME type
  - `cacheControl` (string): Cache control header
  - `upsert` (boolean): Allow overwriting existing files
  - `metadata` (object): Custom metadata

**Returns:** `Promise<UploadResult>`

```typescript
const { data, error } = await storage.upload('path/file.jpg', file, {
  contentType: 'image/jpeg',
  upsert: true,
});
```

### `download(path)`

Download a file from Azure Blob Storage.

**Parameters:**
- `path` (string): The blob path

**Returns:** `Promise<DownloadResult>`

```typescript
const { data: blob, error } = await storage.download('path/file.jpg');
```

### `remove(paths)`

Delete one or more files.

**Parameters:**
- `paths` (string | string[]): Path(s) to delete

**Returns:** `Promise<{ data: null; error: Error | null }>`

```typescript
await storage.remove('path/file.jpg');
await storage.remove(['file1.jpg', 'file2.jpg']);
```

### `list(path, options)`

List files in a directory.

**Parameters:**
- `path` (string, optional): Directory path (default: '')
- `options` (object, optional):
  - `limit` (number): Max number of results
  - `offset` (number): Skip first N results
  - `sortBy` (object): Sort configuration

**Returns:** `Promise<ListResult>`

```typescript
const { data: files, error } = await storage.list('images/', {
  limit: 50,
  sortBy: { column: 'name', order: 'asc' },
});
```

### `getPublicUrl(path)`

Get the public URL for a blob.

**Parameters:**
- `path` (string): The blob path

**Returns:** `string`

```typescript
const url = storage.getPublicUrl('images/photo.jpg');
// Returns: https://account.blob.core.windows.net/container/images/photo.jpg
```

### `exists(path)`

Check if a blob exists.

**Parameters:**
- `path` (string): The blob path

**Returns:** `Promise<boolean>`

```typescript
const exists = await storage.exists('images/photo.jpg');
```

## Migration from Supabase Storage

### Before (Supabase):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const { data, error } = await supabase.storage
  .from('project-images')
  .upload('photos/image.jpg', file);

const { data: publicUrlData } = supabase.storage
  .from('project-images')
  .getPublicUrl('photos/image.jpg');
```

### After (Azure):

```typescript
import { storage } from '@/lib/storage/client';

const { data, error } = await storage.upload('photos/image.jpg', file);

const publicUrl = storage.getPublicUrl('photos/image.jpg');
```

## Integration with Existing Code

### Update Image Upload Service

In `lib/services/image-upload.ts`:

```typescript
// Replace Supabase storage calls
import { storage } from '@/lib/storage/client';

class ImageUploadService {
  async uploadImage(file: File, projectId: string) {
    const path = `projects/${projectId}/${Date.now()}-${file.name}`;

    const { data, error } = await storage.upload(path, file, {
      contentType: file.type,
      cacheControl: 'max-age=3600',
    });

    if (error) throw error;

    return {
      url: data.publicUrl,
      path: data.path,
    };
  }

  async deleteImage(path: string) {
    const { error } = await storage.remove(path);
    if (error) throw error;
  }
}
```

### Update API Routes

In `app/api/admin/upload-image/route.ts`:

```typescript
import { storage } from '@/lib/storage/client';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  const path = `uploads/${Date.now()}-${file.name}`;

  const { data, error } = await storage.upload(path, file, {
    contentType: file.type,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    url: data.publicUrl,
    path: data.path,
  });
}
```

## Advanced Usage

### Custom Configuration

```typescript
import { createStorageAdapter } from '@/migration/lib/azure-storage/storage-adapter';

const storage = createStorageAdapter({
  provider: 'azure',
  azure: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING!,
    containerName: 'my-custom-container',
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME!,
  },
});
```

### Error Handling

```typescript
const { data, error } = await storage.upload('path/file.jpg', file);

if (error) {
  if (error.message.includes('already exists')) {
    // Handle duplicate file
  } else if (error.message.includes('permission')) {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

### Batch Operations

```typescript
const files = ['file1.jpg', 'file2.jpg', 'file3.jpg'];

// Upload multiple files
const uploadPromises = files.map(file =>
  storage.upload(`uploads/${file}`, fileData)
);
const results = await Promise.all(uploadPromises);

// Delete multiple files
await storage.remove(files.map(f => `uploads/${f}`));
```

## Troubleshooting

### "Connection string is invalid"

Make sure `AZURE_STORAGE_CONNECTION_STRING` includes all required parts:
```
DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
```

### "Container not found"

Create the container in Azure Portal or programmatically:

```typescript
import { BlobServiceClient } from '@azure/storage-blob';

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient('project-images');

await containerClient.createIfNotExists({
  access: 'blob', // Public read access
});
```

### "Blob already exists"

Set `upsert: true` in upload options to allow overwriting:

```typescript
await storage.upload('path/file.jpg', file, { upsert: true });
```

## Performance Tips

1. **Enable CDN**: Use Azure CDN for faster global delivery
2. **Use caching headers**: Set appropriate `cacheControl` values
3. **Batch operations**: Upload/delete multiple files in parallel
4. **Optimize images**: Resize/compress before uploading

## Security Considerations

1. **Container Access**: Set to 'blob' (public read) or 'private' + SAS tokens
2. **CORS**: Configure CORS rules in Azure Portal if needed
3. **Firewall**: Restrict access by IP if necessary
4. **Keys**: Never expose storage keys in client-side code

## Next Steps

1. Replace all Supabase storage calls with this adapter
2. Update environment variables in production
3. Test file uploads/downloads
4. Monitor Azure Storage metrics
5. Set up CDN for better performance
