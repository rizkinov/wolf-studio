/**
 * Script to fix missing closing brackets in galleryImages arrays
 * 
 * The update-project-pages.cjs script may have caused syntax errors by not properly closing
 * the galleryImages array. This script fixes that by ensuring proper bracket closure.
 * 
 * Usage:
 * node scripts/fix-gallery-brackets.cjs
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all project page files
const projectFiles = glob.sync('app/wolf-studio/our-work/*/page.tsx');

// Regular expression to find galleryImages arrays with missing closing brackets
const galleryArrayPattern = /galleryImages:\s*\[([\s\S]*?)\}\s*\n\s*\n\s*\};/g;
const fixedGalleryArray = 'galleryImages: [$1}\n  ]\n};';

// Process each file
projectFiles.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if the file has the issue
  if (galleryArrayPattern.test(content)) {
    console.log(`  - Found and fixing issue in ${filePath}`);
    // Replace pattern with fixed version
    content = content.replace(galleryArrayPattern, fixedGalleryArray);
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  - Fixed ${filePath}`);
  }
});

console.log('Completed fixing gallery brackets in project files.'); 