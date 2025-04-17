import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directories if they don't exist
const createDirs = () => {
  const baseDir = path.join(__dirname, '../public/scraped-images');
  const workProjectsDir = path.join(baseDir, 'work-projects');
  const ihhDir = path.join(workProjectsDir, 'ihh');
  
  // Create directories if they don't exist
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  if (!fs.existsSync(workProjectsDir)) {
    fs.mkdirSync(workProjectsDir);
  }
  
  if (!fs.existsSync(ihhDir)) {
    fs.mkdirSync(ihhDir);
  }
  
  return { baseDir, workProjectsDir, ihhDir };
};

// Download image from URL
const downloadImage = (url, filePath) => {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url} -> ${filePath}`);
    
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

// Get highest quality version of an image URL
const getHighResImageUrl = (url) => {
  try {
    // For Wix images, try to get the highest quality by modifying URL parameters
    if (url.includes('wixstatic.com')) {
      // Remove quality reduction and compression params
      url = url.replace(/w_\d+,/g, 'w_3000,')
               .replace(/h_\d+,/g, 'h_3000,')
               .replace(/q_\d+/g, 'q_100')
               .replace(/usm_[\d.]+_[\d.]+_[\d.]+/g, '')
               .replace(/enc_auto|enc_webp|enc_avif/g, '')
               .replace(/quality_[\w]+/g, 'quality_original');
    }
    return url;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return url;
  }
};

// Extract image name from URL
const getImageName = (url, index, isHero = false) => {
  if (isHero) {
    return 'ihh-banner.jpg';
  }
  
  // Try to extract a meaningful name from the URL
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  let filename = pathParts[pathParts.length - 1];
  
  // Remove any query parameters or version info
  if (filename.includes('?')) {
    filename = filename.split('?')[0];
  }
  
  // If it has a valid extension, use it, otherwise default to jpg
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasValidExtension = validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  
  if (!hasValidExtension) {
    filename = `IR5_${6890 + index}.jpg`;
  }
  
  return filename;
};

// Main scraping function
const scrapeIHHImages = async () => {
  const { baseDir, workProjectsDir, ihhDir } = createDirs();
  const browser = await chromium.launch({ headless: false });
  
  // Set a larger viewport size to get higher-resolution images
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    console.log('Navigating to IHH project page...');
    await page.goto('https://www.wolf-studio.com/ihh', { 
      timeout: 60000,
      waitUntil: 'networkidle'
    });
    
    console.log('Waiting for page to fully load...');
    await page.waitForTimeout(5000);
    
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
        if (src && !src.includes('data:image/svg+xml') && !src.includes('data:image/gif;base64')) {
          // Get best source from srcset if available
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
          
          // Measure size and position
          const rect = img.getBoundingClientRect();
          const imageData = {
            src: bestSrc, 
            altText,
            width: rect.width, 
            height: rect.height,
            top: rect.top,
            isHero: rect.width > 800 && rect.top < 300,
            className: img.className || ''
          };
          
          // Try to get data URI for direct pixel data
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || rect.width;
            canvas.height = img.naturalHeight || rect.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            imageData.dataUrl = canvas.toDataURL('image/jpeg', 1.0);
          } catch (e) {
            // Ignore errors, we'll fall back to the src
          }
          
          results.push(imageData);
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
          
          results.push({ 
            src: matches[1], 
            altText,
            width: rect.width, 
            height: rect.height,
            top: rect.top,
            isHero: rect.width > 800 && rect.top < 300,
            className: el.className || ''
          });
        }
      });
      
      return results;
    });
    
    console.log(`Found ${images.length} images on the IHH project page`);
    
    // Download images
    for (let i = 0; i < images.length; i++) {
      const { src, isHero, dataUrl } = images[i];
      try {
        // Create a more descriptive filename
        const fileName = getImageName(src, i, isHero);
        const filePath = path.join(ihhDir, fileName);
        
        // If we have a data URL, save it directly
        if (dataUrl) {
          const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const data = Buffer.from(matches[2], 'base64');
            fs.writeFileSync(filePath, data);
            console.log(`Saved image from data URL: ${fileName}`);
            continue;
          }
        }
        
        // Otherwise, try to get high-res version of the URL
        const originalUrl = new URL(src).href;
        const highResUrl = getHighResImageUrl(originalUrl);
        
        console.log(`Downloading image ${i+1}/${images.length}: ${highResUrl}`);
        await downloadImage(highResUrl, filePath);
        
        // Save hero image to work folder for portfolio display
        if (isHero) {
          const workFilePath = path.join(baseDir, 'work', fileName);
          await downloadImage(highResUrl, workFilePath);
        }
      } catch (error) {
        console.error(`Error downloading image ${src}:`, error.message);
      }
    }
    
    console.log('\nIHH image scraping completed!');
    
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
};

// Run the script
scrapeIHHImages().catch(console.error); 