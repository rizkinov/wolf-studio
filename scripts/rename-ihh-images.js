import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const sourceDir = path.join(__dirname, '../public/scraped-images/work-projects/ihh');
const projectFilePath = path.join(__dirname, '../app/wolf-studio/our-work/ihh/page.tsx');

// Define naming map (old filename -> new filename)
const imageNameMap = {
  // Banner image
  'ihh-banner.jpg': 'ihh-banner.jpg',
  
  // Gallery images with descriptive names
  '5df5e7_30134d18a8e84539a884151bb9bcfa85~mv2.jpg': 'ihh-interior-01.jpg',
  '5df5e7_74fde731fddf4a54823e35ccbaeef9ed~mv2.jpg': 'ihh-workspace-02.jpg',
  '5df5e7_060a4218e5b14733893b0e80757928f2~mv2.jpg': 'ihh-collaborative-03.jpg',
  '5df5e7_047bde006f49432b81a57d01170e14c5~mv2.jpg': 'ihh-meeting-04.jpg',
  '5df5e7_9a6f890bec2446aba3175bfa27f10ab5~mv2.jpg': 'ihh-office-05.jpg',
  '5df5e7_0a7f3d6413a34fc2967eb742d0846bfb~mv2.jpg': 'ihh-reception-06.jpg',
  '5df5e7_7e4e7bfc57ab47f48118b6a761647fb7~mv2.jpg': 'ihh-lounge-07.jpg',
  '5df5e7_e000121cc07342f2972b0b69d9fa53f8~mv2.jpg': 'ihh-environment-08.jpg',
  '5df5e7_58b43757ab72433ba1128ec4b33a6724~mv2.jpg': 'ihh-common-09.jpg',
  
  // Handle the duplicate with a different name
  '5df5e7_30134d18a8e84539a884151bb9bcfa85~mv2 (1).jpg': 'ihh-detail-10.jpg'
};

// Updated project data structure for the page
const updatedGalleryImages = [
  { 
    id: "interior-01", 
    alt: "IHH Healthcare Interior Design",
    url: "/scraped-images/work-projects/ihh/ihh-interior-01.jpg"
  },
  { 
    id: "workspace-02", 
    alt: "IHH Healthcare Workspace",
    url: "/scraped-images/work-projects/ihh/ihh-workspace-02.jpg"
  },
  { 
    id: "collaborative-03", 
    alt: "IHH Healthcare Collaborative Space",
    url: "/scraped-images/work-projects/ihh/ihh-collaborative-03.jpg"
  },
  { 
    id: "meeting-04", 
    alt: "IHH Healthcare Meeting Area",
    url: "/scraped-images/work-projects/ihh/ihh-meeting-04.jpg"
  },
  { 
    id: "office-05", 
    alt: "IHH Healthcare Office Space",
    url: "/scraped-images/work-projects/ihh/ihh-office-05.jpg"
  },
  { 
    id: "reception-06", 
    alt: "IHH Healthcare Reception",
    url: "/scraped-images/work-projects/ihh/ihh-reception-06.jpg"
  },
  { 
    id: "lounge-07", 
    alt: "IHH Healthcare Lounge Area",
    url: "/scraped-images/work-projects/ihh/ihh-lounge-07.jpg"
  },
  { 
    id: "environment-08", 
    alt: "IHH Healthcare Work Environment",
    url: "/scraped-images/work-projects/ihh/ihh-environment-08.jpg"
  },
  { 
    id: "detail-10", 
    alt: "IHH Healthcare Design Detail",
    url: "/scraped-images/work-projects/ihh/ihh-detail-10.jpg"
  },
  { 
    id: "common-09", 
    alt: "IHH Healthcare Common Area",
    url: "/scraped-images/work-projects/ihh/ihh-common-09.jpg"
  }
];

// Function to rename files
async function renameFiles() {
  console.log('Starting image rename process...');
  
  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory does not exist: ${sourceDir}`);
    return;
  }
  
  // Get all files in the directory
  const files = fs.readdirSync(sourceDir);
  
  // Create a backup of existing files first
  const backupDir = path.join(sourceDir, 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  console.log('Creating backup of original files...');
  for (const file of files) {
    if (file !== 'backup') {
      const sourcePath = path.join(sourceDir, file);
      const backupPath = path.join(backupDir, file);
      fs.copyFileSync(sourcePath, backupPath);
    }
  }
  
  // Rename files
  console.log('Renaming files...');
  for (const [oldName, newName] of Object.entries(imageNameMap)) {
    const oldPath = path.join(sourceDir, oldName);
    const newPath = path.join(sourceDir, newName);
    
    if (fs.existsSync(oldPath)) {
      console.log(`Renaming: ${oldName} -> ${newName}`);
      fs.renameSync(oldPath, newPath);
    } else {
      console.warn(`Warning: Original file not found: ${oldName}`);
    }
  }
  
  // Update project file with new image references
  console.log('Updating project file with new image paths...');
  
  try {
    let projectFileContent = fs.readFileSync(projectFilePath, 'utf8');
    
    // Update the banner image path if needed
    if (imageNameMap['ihh-banner.jpg'] !== 'ihh-banner.jpg') {
      projectFileContent = projectFileContent.replace(
        '/scraped-images/work-projects/ihh/ihh-banner.jpg',
        `/scraped-images/work-projects/ihh/${imageNameMap['ihh-banner.jpg']}`
      );
    }
    
    // Find the galleryImages array in the file
    const galleryImagesPattern = /galleryImages:\s*\[([\s\S]*?)\]/;
    const match = projectFileContent.match(galleryImagesPattern);
    
    if (match) {
      // Create the new gallery images array as a string
      const newGalleryImagesStr = 'galleryImages: ' + JSON.stringify(updatedGalleryImages, null, 2);
      
      // Replace the old gallery images array with the new one
      projectFileContent = projectFileContent.replace(
        galleryImagesPattern,
        newGalleryImagesStr
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(projectFilePath, projectFileContent);
      console.log('Project file updated successfully.');
    } else {
      console.error('Could not find galleryImages array in project file.');
    }
  } catch (error) {
    console.error('Error updating project file:', error);
  }
  
  console.log('Image rename process completed!');
}

// Run the rename function
renameFiles().catch(console.error); 