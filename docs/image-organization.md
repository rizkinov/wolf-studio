# Image Organization Guidelines

This document outlines the standardized approach to organizing and referencing images in the WOLF Studio project.

## Directory Structure

All project images should be organized according to the following structure:

```
/public/scraped-images/work-projects/{projectname}/
```

Where `{projectname}` is the project ID (slug) used in the URL and code, e.g., `internationallawfirm`, `heineken`, etc.

## Naming Conventions

Images should follow these naming conventions:

1. **Banner images**: `{projectname}-banner.jpg`
   - Example: `internationallawfirm-banner.jpg`

2. **Gallery images**: `{projectname}-gallery-{n}.jpg`
   - Example: `internationallawfirm-gallery-1.jpg`, `internationallawfirm-gallery-2.jpg`, etc.

## Path References

When referencing images in code, use the following path patterns:

1. **In project data files** (e.g., `data/projects.ts`):
   ```javascript
   bannerImage: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-banner.jpg"
   ```

2. **In project page files** (e.g., `.tsx` files):
   ```javascript
   // For banner images
   bannerImage: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-banner.jpg"
   
   // For gallery images
   galleryImages: [
     { 
       id: "gallery-1", 
       alt: "Description of the image",
       url: "/scraped-images/work-projects/internationallawfirm/internationallawfirm-gallery-1.jpg"
     },
     // ...more gallery images
   ]
   ```

## Image Migration

To migrate existing projects to this standard, use the scripts in the `scripts/` directory:

1. Run `node scripts/update-project-paths.js` to update the `projects.ts` file
2. Run `node scripts/update-project-pages.js` to update all project page files
3. Run `bash scripts/organize-images.sh` to copy and rename image files to the new structure

## Why This Structure?

This standardized approach offers several benefits:

1. **Consistency**: All project images follow the same pattern, making code more predictable
2. **Maintainability**: Easy to find and manage images for specific projects
3. **Scalability**: New projects can be added following the same conventions
4. **SEO**: Image filenames include the project name, which can help with search engine optimization
5. **Organization**: Clear separation between different types of images (banner vs. gallery)

## Image Requirements

For optimal performance and consistency, follow these guidelines for project images:

1. **Banner Images**:
   - Recommended size: 1920×1080px (16:9 ratio)
   - Format: JPG
   - Quality: 80-90%

2. **Gallery Images**:
   - Recommended size: 1200×800px
   - Format: JPG
   - Quality: 80-90%

Remember to optimize all images for web use to ensure fast loading times. 