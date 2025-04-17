import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directories for different image categories
const createDirs = () => {
  const baseDir = path.join(__dirname, '../public/scraped-images');
  const categories = ['team', 'work', 'office', 'social'];
  
  // Create base directory if it doesn't exist
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  // Create category directories
  categories.forEach(category => {
    const categoryDir = path.join(baseDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir);
    }
  });

  // Create separate directory for work projects
  const workProjectsDir = path.join(baseDir, 'work-projects');
  if (!fs.existsSync(workProjectsDir)) {
    fs.mkdirSync(workProjectsDir);
  }
  
  return { baseDir, categories, workProjectsDir };
};

// Download image from URL
const downloadImage = (url, filePath) => {
  return new Promise((resolve, reject) => {
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`File already exists: ${filePath}`);
      return resolve();
    }
    
    // Handle http or data URLs differently
    if (url.startsWith('data:')) {
      // For data URLs, extract the base64 data and save it
      const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const data = Buffer.from(matches[2], 'base64');
        fs.writeFile(filePath, data, err => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        reject(new Error('Invalid data URL'));
      }
      return;
    }

    // For HTTP URLs, download the file
    https.get(url, response => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
      
      const file = fs.createWriteStream(filePath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', err => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', err => {
      reject(err);
    });
  });
};

// Extract project URLs from work page
const extractProjectUrls = async (page) => {
  console.log('Extracting project URLs from work page...');
  
  try {
    await page.goto('https://www.wolf-studio.com/work', { 
      timeout: 60000,
      waitUntil: 'load' 
    });
    
    await page.waitForTimeout(5000);
    
    // Extract all project links from the work page
    const projectUrls = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .filter(link => {
          const href = link.href;
          // Filter links that are likely project pages - exclude certain patterns
          return href && 
            href.includes('wolf-studio.com/') && 
            !href.includes('/work') && 
            !href.includes('/meet-the-pack') && 
            !href.includes('/what-we-offer') && 
            !href.includes('/our-hideout') && 
            !href.includes('/get-in-touch') && 
            !href.includes('/social') &&
            !href.includes('facebook.com') && 
            !href.includes('instagram.com') &&
            !href.includes('linkedin.com');
        })
        .map(link => link.href);
    });
    
    // Remove duplicates
    const uniqueUrls = [...new Set(projectUrls)];
    console.log(`Found ${uniqueUrls.length} potential project URLs`);
    
    // Add some known project URLs that might not be detected
    const knownProjects = [
      'https://www.wolf-studio.com/ihh',
      'https://www.wolf-studio.com/managementconsultingsg',
      'https://www.wolf-studio.com/philipmorrissingapore'
    ];
    
    knownProjects.forEach(url => {
      if (!uniqueUrls.includes(url)) {
        uniqueUrls.push(url);
      }
    });
    
    return uniqueUrls;
  } catch (error) {
    console.error('Error extracting project URLs:', error);
    // Return at least the known projects if there's an error
    return [
      'https://www.wolf-studio.com/ihh',
      'https://www.wolf-studio.com/managementconsultingsg',
      'https://www.wolf-studio.com/philipmorrissingapore'
    ];
  }
};

// Main scraping function
const scrapeImages = async () => {
  const { baseDir, categories, workProjectsDir } = createDirs();
  const browser = await chromium.launch({ headless: true });
  
  // Set a larger viewport size to get higher-resolution images
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    // Get all project URLs
    const projectUrls = await extractProjectUrls(page);
    console.log(`Found ${projectUrls.length} project URLs to scrape`);
    
    // Store project details for later use
    const projectDetails = [];
    
    // Scrape each project page
    for (const projectUrl of projectUrls) {
      const projectSlug = projectUrl.split('/').pop();
      console.log(`\nScraping project: ${projectSlug} (${projectUrl})`);
      
      // Create project directory
      const projectDir = path.join(workProjectsDir, projectSlug);
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir);
      }
      
      try {
        // Navigate to the project page
        await page.goto(projectUrl, { 
          timeout: 60000,
          waitUntil: 'load' 
        });
        
        console.log('Waiting for page to fully load...');
        await page.waitForTimeout(5000);
        
        // Extract project title and description
        const projectInfo = await page.evaluate(() => {
          // Try to find the project title - typically in headings
          let title = '';
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          for (const heading of headings) {
            if (heading.textContent && heading.textContent.trim() !== '') {
              title = heading.textContent.trim();
              // If the title is in all caps, convert to title case
              if (title === title.toUpperCase()) {
                title = title.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');
              }
              break;
            }
          }
          
          // Try to find the project description
          const paragraphs = Array.from(document.querySelectorAll('p'));
          let description = '';
          for (const p of paragraphs) {
            if (p.textContent && p.textContent.trim() !== '' && p.textContent.length > 50) {
              description = p.textContent.trim();
              break;
            }
          }
          
          // Get project details like size, location, scope, year
          const detailLabels = ['size', 'location', 'scope', 'year'];
          const details = {};
          
          // Look for these labels in the text
          const allElements = Array.from(document.querySelectorAll('*'));
          for (const label of detailLabels) {
            for (const el of allElements) {
              if (el.textContent && el.textContent.toLowerCase().includes(label)) {
                const textContent = el.textContent.trim();
                // Extract the value after the label (usually formatted as "label / value")
                const match = textContent.match(new RegExp(`${label}\\s*[/:]*\\s*(.+)`, 'i'));
                if (match && match[1]) {
                  details[label] = match[1].trim();
                  break;
                }
              }
            }
          }
          
          return { title, description, details };
        });
        
        console.log(`Project Title: ${projectInfo.title}`);
        projectDetails.push({
          slug: projectSlug,
          url: projectUrl,
          ...projectInfo
        });
        
        // Get all images on the page
        const images = await page.evaluate(() => {
          // Find all images and background images
          const imgElements = Array.from(document.querySelectorAll('img'));
          const elementsWithBg = Array.from(document.querySelectorAll('*')).filter(el => {
            const style = window.getComputedStyle(el);
            return style.backgroundImage !== 'none' && style.backgroundImage.includes('url');
          });
          
          // Get image sources
          const results = [];
          
          // For regular images
          imgElements.forEach(img => {
            const src = img.src;
            if (src && !src.includes('data:image/svg+xml') && !src.includes('data:image/gif;base64') && 
                !src.includes('facebook.com') && !src.includes('instagram.com')) {
              
              // Check for higher resolution in srcset
              let bestSrc = src;
              if (img.srcset) {
                const srcsetItems = img.srcset.split(',').map(s => s.trim());
                let highestWidth = 0;
                
                for (const srcsetItem of srcsetItems) {
                  const [itemSrc, widthDescriptor] = srcsetItem.split(' ');
                  if (widthDescriptor && widthDescriptor.includes('w')) {
                    const width = parseInt(widthDescriptor.replace('w', ''));
                    if (width > highestWidth) {
                      highestWidth = width;
                      bestSrc = itemSrc;
                    }
                  }
                }
              }
              
              // Get alt text or title if available
              const altText = img.alt || img.title || '';
              
              // Detect if it could be a banner/cover image
              const rect = img.getBoundingClientRect();
              const isBanner = rect.width > 500 && rect.top < 500;
              
              results.push({ 
                src: bestSrc, 
                altText, 
                width: rect.width, 
                height: rect.height,
                isBanner
              });
            }
          });
          
          // For background images
          elementsWithBg.forEach(el => {
            const style = window.getComputedStyle(el);
            const bgImage = style.backgroundImage;
            const matches = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
            
            if (matches && matches[1]) {
              const rect = el.getBoundingClientRect();
              const altText = el.getAttribute('aria-label') || el.getAttribute('title') || '';
              const isBanner = rect.width > 500 && rect.top < 500;
              
              results.push({ 
                src: matches[1], 
                altText,
                width: rect.width, 
                height: rect.height,
                isBanner
              });
            }
          });
          
          return results;
        });
        
        console.log(`Found ${images.length} images on the project page`);
        
        // Find banner image (usually the first large image at the top of the page)
        const bannerImages = images.filter(img => img.isBanner);
        const bannerImage = bannerImages.length > 0 ? bannerImages[0] : (images.length > 0 ? images[0] : null);
        
        // Download images
        for (let i = 0; i < images.length; i++) {
          const { src, isBanner } = images[i];
          try {
            const originalUrl = new URL(src).href;
            
            // We'll try the original URL first
            const url = originalUrl;
            
            // Create more user-friendly filenames using media IDs
            const mediaId = getMediaIdFromUrl(url);
            
            // Define filename based on whether it's a banner
            let fileName;
            if (isBanner && images[i] === bannerImage) {
              fileName = `${projectSlug}-banner.${mediaId.includes('.') ? mediaId.split('.').pop() : 'jpg'}`;
              
              // Also save banner to the main work folder for portfolio display
              const workFilePath = path.join(baseDir, 'work', fileName);
              await downloadImage(url, workFilePath);
              console.log(`Saved banner to work folder: ${fileName}`);
            } else {
              fileName = `${projectSlug}-image-${i + 1}.${mediaId.includes('.') ? mediaId.split('.').pop() : 'jpg'}`;
            }
            
            const filePath = path.join(projectDir, fileName);
            console.log(`Downloading image ${i+1}/${images.length}: ${url} -> ${projectSlug}/${fileName}`);
            await downloadImage(url, filePath);
          } catch (error) {
            console.error(`Error downloading image ${src}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`Error scraping project ${projectSlug}:`, error);
      }
    }
    
    // Save project details to a JSON file for later use in creating pages
    const projectsDataPath = path.join(baseDir, 'work-projects', 'projects.json');
    fs.writeFileSync(projectsDataPath, JSON.stringify(projectDetails, null, 2));
    console.log(`Saved project details to ${projectsDataPath}`);
    
    console.log('\nProject scraping completed!');
    
    // Also run the original image scraping for other site sections
    await scrapeGeneralImages(browser);
    
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
};

// General image scraping for other site sections
const scrapeGeneralImages = async (browser) => {
  console.log('\nScraping general site images...');
  const { baseDir, categories } = createDirs();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const pagesToVisit = [
    'https://www.wolf-studio.com/',
    'https://www.wolf-studio.com/meet-the-pack',
    'https://www.wolf-studio.com/what-we-offer',
    'https://www.wolf-studio.com/our-hideout',
    'https://www.wolf-studio.com/social'
  ];
  
  try {
    const allImages = [];
    
    // Loop through each page to scrape
    for (const pageUrl of pagesToVisit) {
      console.log(`Navigating to ${pageUrl}...`);
      
      try {
        // Increase timeout to 60 seconds and wait for load instead of networkidle
        await page.goto(pageUrl, { 
          timeout: 60000,
          waitUntil: 'load' 
        });
        
        // Wait for additional time to ensure images are loaded
        console.log('Waiting for page to fully load...');
        await page.waitForTimeout(5000);
        
        // Get all image elements
        const images = await page.evaluate((currentUrl) => {
          // Find all images and background images
          const imgElements = Array.from(document.querySelectorAll('img'));
          const elementsWithBg = Array.from(document.querySelectorAll('*')).filter(el => {
            const style = window.getComputedStyle(el);
            return style.backgroundImage !== 'none' && style.backgroundImage.includes('url');
          });
          
          // Get image sources and their section context
          const results = [];
          
          // For regular images
          imgElements.forEach(img => {
            const src = img.src;
            if (src && !src.includes('data:image/svg+xml') && !src.includes('data:image/gif;base64') &&
                !src.includes('facebook.com') && !src.includes('instagram.com')) {
              let sectionId = '';
              let parentElement = img.parentElement;
              
              // Get alt text or title if available
              const altText = img.alt || img.title || '';
              
              // Look for parent section or div with an id
              while (parentElement && !sectionId) {
                if (parentElement.id || parentElement.className) {
                  sectionId = parentElement.id || parentElement.className;
                }
                parentElement = parentElement.parentElement;
              }
              
              // Determine context based on current page
              let context = '';
              if (currentUrl.includes('meet-the-pack')) context = 'meet-the-pack-page';
              if (currentUrl.includes('our-hideout')) context = 'office-page';
              
              results.push({ src, sectionId, altText, context });
            }
          });
          
          // For background images (similar logic)
          elementsWithBg.forEach(el => {
            const style = window.getComputedStyle(el);
            const bgImage = style.backgroundImage;
            const matches = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
            
            if (matches && matches[1]) {
              let sectionId = '';
              let parentElement = el;
              
              // Look for parent section or div with an id
              while (parentElement && !sectionId) {
                if (parentElement.id || parentElement.className) {
                  sectionId = parentElement.id || parentElement.className;
                }
                parentElement = parentElement.parentElement;
              }
              
              // Determine context based on current page
              let context = '';
              if (currentUrl.includes('meet-the-pack')) context = 'meet-the-pack-page';
              if (currentUrl.includes('our-hideout')) context = 'office-page';
              
              const altText = el.getAttribute('aria-label') || el.getAttribute('title') || '';
              
              results.push({ src: matches[1], sectionId, altText, context });
            }
          });
          
          return results;
        }, pageUrl);
        
        allImages.push(...images);
      } catch (error) {
        console.error(`Error scraping ${pageUrl}:`, error.message);
      }
    }
    
    console.log(`Found ${allImages.length} general images in total`);
    
    // Categorization function
    const categorizeImage = (url, sectionId, altText, context) => {
      // Team photos
      if (context === 'meet-the-pack-page' || 
          sectionId.includes('meet-the-pack') || sectionId.includes('team') || 
          url.includes('team') || url.includes('people') || 
          altText.includes('team') || altText.includes('member')) {
        return 'team';
      }
      
      // Office photos
      if (context === 'office-page' || 
          sectionId.includes('our-hideout') || 
          url.includes('office') || url.includes('space') ||
          altText.includes('office') || altText.includes('space')) {
        return 'office';
      }
      
      // Social media photos
      if (sectionId.includes('social') || 
          url.includes('instagram') || 
          altText.includes('social') || altText.includes('instagram')) {
        return 'social';
      }
      
      // Work photos - but we've already handled these separately
      if (sectionId.includes('our-work') || 
          url.includes('work') || url.includes('project') ||
          altText.includes('work') || altText.includes('project')) {
        return 'work';
      }
      
      // Default category
      return 'work';
    };
    
    // Download and categorize general images
    for (let i = 0; i < allImages.length; i++) {
      const { src, sectionId, altText, context } = allImages[i];
      try {
        const url = new URL(src).href;
        const category = categorizeImage(
          url.toLowerCase(), 
          sectionId.toLowerCase(), 
          altText.toLowerCase(), 
          context
        );
        
        // Use media ID for filename
        const mediaId = getMediaIdFromUrl(url);
        const fileName = `general-${i+1}-${mediaId}`;
        
        const filePath = path.join(baseDir, category, fileName);
        
        console.log(`Downloading general image ${i+1}/${allImages.length}: ${url} -> ${category}/${fileName}`);
        await downloadImage(url, filePath);
      } catch (error) {
        console.error(`Error downloading image ${src}:`, error.message);
      }
    }
    
    console.log('General image scraping completed!');
  } catch (error) {
    console.error('Error during general scraping:', error);
  }
};

// Get better quality image URL from Wix CDN
const getHighResImageUrl = (url) => {
  try {
    // Check if it's a Wix media URL
    if (url.includes('wixstatic.com/media/')) {
      // Extract just the media ID
      let mediaId = url.split('wixstatic.com/media/')[1].split('/')[0];
      if (mediaId.includes('.')) {
        mediaId = mediaId.split('?')[0]; // Remove any query parameters
      }
      
      // Try different approaches for getting high-res versions
      
      // 1. Try to construct an "original" URL - may not work for all images
      return `https://static.wixstatic.com/media/${mediaId}`;
    }
    
    // For non-Wix URLs, return as is
    return url;
  } catch (error) {
    console.log(`Error processing URL ${url}:`, error);
    return url;
  }
};

// Extract media ID from URL for filename
const getMediaIdFromUrl = (url) => {
  try {
    if (url.includes('wixstatic.com/media/')) {
      let mediaId = url.split('wixstatic.com/media/')[1].split('/')[0];
      // Keep the original extension if it exists
      if (mediaId.includes('.')) {
        return mediaId.split('?')[0]; // Remove any query parameters
      }
      return mediaId;
    }
    return path.basename(url).split('?')[0] || `img_${Math.random().toString(36).substring(2, 8)}.jpg`;
  } catch (error) {
    return `img_${Math.random().toString(36).substring(2, 8)}.jpg`;
  }
};

// Run the scraper
scrapeImages().catch(console.error); 