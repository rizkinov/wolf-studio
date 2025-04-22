/**
 * Script to update image paths in projects.ts
 * 
 * This script reads the projects.ts file and updates all banner image paths
 * to use the standardized format:
 * /scraped-images/work-projects/{projectname}/{projectname}-banner.jpg
 * 
 * Usage:
 * node scripts/update-project-paths.js
 */

const fs = require('fs');
const path = require('path');

// Path to projects.ts file
const projectsFilePath = path.join(__dirname, '../data/projects.ts');

// Read the file content
let content = fs.readFileSync(projectsFilePath, 'utf-8');

// Regular expression to match project banner image paths
const bannerImageRegex = /(bannerImage:\s*)"(\/[^"]+)"/g;

// Replace old paths with new standardized paths
content = content.replace(bannerImageRegex, (match, prefix, oldPath) => {
  // Extract project ID from the path
  const pathParts = oldPath.split('/');
  const projectId = pathParts[pathParts.length - 2]; // Assuming format /wolf-studio/our-work/projectId/banner.jpg
  
  // Construct new path
  const newPath = `/scraped-images/work-projects/${projectId}/${projectId}-banner.jpg`;
  
  return `${prefix}"${newPath}"`;
});

// Write the updated content back to the file
fs.writeFileSync(projectsFilePath, content, 'utf-8');

console.log('Updated image paths in projects.ts');
console.log('Next steps:');
console.log('1. Update all project page files to use the new image paths');
console.log('2. Run the organize-images.sh script to copy and rename image files'); 