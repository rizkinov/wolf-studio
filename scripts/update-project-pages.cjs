/**
 * Script to update image paths in all project page files
 * 
 * This script scans project page files and updates:
 * 1. Banner image paths to use the standardized format:
 *    /scraped-images/work-projects/{projectname}/{projectname}-banner.jpg
 * 2. Gallery image paths to use the standardized format:
 *    /scraped-images/work-projects/{projectname}/{projectname}-gallery-{n}.jpg
 * 
 * Usage:
 * node scripts/update-project-pages.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all project page files
const projectFiles = glob.sync('app/wolf-studio/our-work/*/page.tsx');

// Process each file
projectFiles.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  // Extract project ID from the path
  const pathParts = filePath.split('/');
  const projectId = pathParts[pathParts.length - 2];
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update banner image path
  // This handles different formats that might exist in different files
  const bannerPatterns = [
    // For direct URL string assignment
    /(bannerImage:\s*)"([^"]+)"/g,
    // For object with url property
    /(bannerImage:\s*\{\s*url:\s*)"([^"]+)"/g
  ];
  
  bannerPatterns.forEach(pattern => {
    content = content.replace(pattern, (match, prefix, oldPath) => {
      const newPath = `/scraped-images/work-projects/${projectId}/${projectId}-banner.jpg`;
      return `${prefix}"${newPath}"`;
    });
  });
  
  // Update gallery image paths
  // Find gallery image array sections
  const galleryPattern = /galleryImages:\s*\[([\s\S]*?)\]/g;
  content = content.replace(galleryPattern, (match, galleryContent) => {
    // Split gallery items by closing brace to get individual items
    const items = galleryContent.split('},');
    
    if (items.length <= 1) return match; // No valid items found
    
    // Process each gallery item
    const updatedItems = items.map((item, index) => {
      if (index === items.length - 1 && !item.includes('}')) {
        // Last item might not have a closing brace
        return item;
      }
      
      // Update the url property
      const updatedItem = item.replace(/(url:\s*)"([^"]+)"/g, (urlMatch, urlPrefix, oldPath) => {
        const galleryIndex = index + 1;
        const newPath = `/scraped-images/work-projects/${projectId}/${projectId}-gallery-${galleryIndex}.jpg`;
        return `${urlPrefix}"${newPath}"`;
      });
      
      return updatedItem;
    });
    
    // Reassemble the gallery section
    return `galleryImages: [${updatedItems.join('},')}`; 
  });
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf-8');
});

console.log('Updated image paths in all project page files');
console.log('Next steps:');
console.log('1. Run the organize-images.sh script to copy and rename image files'); 