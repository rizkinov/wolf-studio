#!/usr/bin/env node

/**
 * This script finds all project page files and updates them to use 
 * the shared BackToWorkButton component.
 * 
 * Run with: node scripts/update-buttons.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectsDir = path.join(path.resolve(__dirname, '..'), 'app/wolf-studio/our-work');

// Import statement to add
const importStatement = `import { BackToWorkButton } from '@/components/back-to-work-button'`;

// Old button pattern to replace
const oldButtonPattern = /\s*<div className="mt-12 text-center">\s*<Link href="\/wolf-studio\/our-work">\s*<CBREButton variant="view-more">\s*Back to work\s*<\/CBREButton>\s*<\/Link>\s*<\/div>/;

// New button component
const newButton = `\n          <BackToWorkButton />`;

// Process all project directories
function updateProjectPages() {
  console.log(`Scanning for project pages in: ${projectsDir}`);
  
  try {
    // Get list of all project directories
    const projectDirs = fs.readdirSync(projectsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
      
    console.log(`Found ${projectDirs.length} project directories`);
    
    let updatedCount = 0;
    
    // Process each project directory
    projectDirs.forEach(projectDir => {
      const pageFile = path.join(projectsDir, projectDir, 'page.tsx');
      
      if (fs.existsSync(pageFile)) {
        let content = fs.readFileSync(pageFile, 'utf8');
        
        // Check if import is already present
        if (!content.includes('BackToWorkButton')) {
          // Add import statement after other imports
          content = content.replace(
            /(import.*from.*['"].*['"].*\n)(?!import)/,
            `$1import { BackToWorkButton } from '@/components/back-to-work-button'\n\n`
          );
          
          // Replace old button with new component
          content = content.replace(oldButtonPattern, newButton);
          
          // Write changes back to file
          fs.writeFileSync(pageFile, content, 'utf8');
          updatedCount++;
          
          console.log(`Updated: ${projectDir}/page.tsx`);
        } else {
          console.log(`Skipped (already updated): ${projectDir}/page.tsx`);
        }
      } else {
        console.log(`Warning: No page.tsx found in ${projectDir}`);
      }
    });
    
    console.log(`\nUpdate complete! Modified ${updatedCount} project pages.`);
    
  } catch (error) {
    console.error(`Error updating project pages: ${error.message}`);
    process.exit(1);
  }
}

// Execute the update
updateProjectPages(); 