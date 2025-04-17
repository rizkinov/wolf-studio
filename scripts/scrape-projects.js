import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for saving output
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to analyze page structure
async function analyzePageStructure(page) {
  return await page.evaluate(() => {
    const analysis = {
      headings: [],
      sections: [],
      potentialGalleries: [],
      interactiveElements: []
    };
    
    // Collect all headings
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
      analysis.headings.push({
        level: heading.tagName,
        text: heading.innerText.trim(),
        isVisible: heading.offsetParent !== null,
        classes: Array.from(heading.classList),
        id: heading.id
      });
    });
    
    // Identify potential section containers
    document.querySelectorAll('section, div[class*="section"], div[class*="container"]').forEach(section => {
      if (section.offsetHeight > 100) { // Only consider reasonably sized sections
        analysis.sections.push({
          tagName: section.tagName,
          classes: Array.from(section.classList),
          id: section.id,
          childCount: section.children.length,
          hasHeading: !!section.querySelector('h1, h2, h3, h4, h5, h6'),
          approximateHeight: section.offsetHeight
        });
      }
    });
    
    // Look for potential gallery or grid elements
    document.querySelectorAll('div[class*="gallery"], div[class*="grid"], div[class*="portfolio"], div[class*="projects"]').forEach(gallery => {
      analysis.potentialGalleries.push({
        classes: Array.from(gallery.classList),
        id: gallery.id,
        childCount: gallery.children.length,
        childTypes: Array.from(gallery.children).map(child => ({
          tag: child.tagName,
          classes: Array.from(child.classList)
        }))
      });
    });
    
    // Find interactive elements that might be project items
    document.querySelectorAll('a, div[role="button"], button, [class*="clickable"], [class*="hover"]').forEach(element => {
      // Only include elements that seem substantial enough to be project items
      if (element.offsetWidth > 100 && element.offsetHeight > 100) {
        analysis.interactiveElements.push({
          tagName: element.tagName,
          classes: Array.from(element.classList),
          hasImage: !!element.querySelector('img'),
          hasBgImage: window.getComputedStyle(element).backgroundImage !== 'none',
          dimensions: {
            width: element.offsetWidth,
            height: element.offsetHeight
          }
        });
      }
    });
    
    return analysis;
  });
}

/**
 * Scrapes project titles and subtitles from the Wolf Studio website
 * These appear on hover in the "Some our work" section
 */
async function scrapeProjectInfo() {
  console.log('Starting project info scraping...');
  
  // Launch browser with visual feedback (non-headless)
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1366, height: 768 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to Wolf Studio website
    console.log('Navigating to Wolf Studio website...');
    await page.goto('https://www.wolf-studio.com/', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Take a screenshot after initial load
    await page.screenshot({ path: path.join(__dirname, '../data/initial-load.png') });
    console.log('Took initial screenshot');
    
    // Handle cookie banner if present
    console.log('Checking for cookie banner...');
    try {
      const acceptSelector = await page.evaluate(() => {
        // Try multiple selectors that might be accept buttons
        const possibleSelectors = [
          '.cookie-accept-btn',
          '.accept-cookies',
          '[data-test="accept-cookie-banner"]',
          'button:has-text("Accept")',
          'button:has-text("I Accept")',
          'button:has-text("Accept All")',
          'button.accept',
          '#accept-cookies'
        ];
        
        for (const selector of possibleSelectors) {
          const el = document.querySelector(selector);
          if (el && el.offsetParent !== null) {
            return selector;
          }
        }
        
        // Look for any button that might accept cookies
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          if (button.offsetParent !== null && 
             (button.textContent.toLowerCase().includes('accept') || 
              button.textContent.toLowerCase().includes('agree'))) {
            // Add a temporary ID to the button
            const tempId = 'temp-cookie-accept-' + Date.now();
            button.id = tempId;
            return '#' + tempId;
          }
        }
        
        return null;
      });
      
      if (acceptSelector) {
        console.log(`Found cookie accept button: ${acceptSelector}`);
        await page.click(acceptSelector);
        await delay(1000); // Wait for banner to dismiss
      }
    } catch (error) {
      console.warn('Error handling cookie banner:', error.message);
    }
    
    // Take a screenshot after cookies banner is handled
    await page.screenshot({ path: path.join(__dirname, '../data/after-cookies.png') });
    
    // Wait for page to stabilize
    await delay(3000);
    
    // Analyze page structure for debugging
    console.log('Analyzing page structure...');
    const pageStructure = await analyzePageStructure(page);
    console.log(`Found ${pageStructure.headings.length} headings, ${pageStructure.sections.length} sections, ${pageStructure.potentialGalleries.length} potential galleries`);
    
    // Save the structure analysis to a file
    fs.writeFileSync(
      path.join(__dirname, '../data/page-structure.json'), 
      JSON.stringify(pageStructure, null, 2)
    );
    
    // Scroll to the "Some our work" section
    console.log('Scrolling to the work section...');
    await page.evaluate(() => {
      // Find elements that might contain work-related content
      // Using valid CSS selectors
      const workHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const workSection = workHeadings.find(el => 
        el.textContent.toLowerCase().includes('work') || 
        el.textContent.toLowerCase().includes('our work') ||
        el.textContent.toLowerCase().includes('some our work')
      );
      
      if (workSection) {
        workSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      
      // If specific selectors don't work, try scrolling about halfway down
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    
    // Wait a bit for any animations to complete
    await page.waitForTimeout(2000);
    
    // Take another screenshot showing the work section
    await page.screenshot({ path: path.join(__dirname, '../data/work-section.png') });

    // Ensure we scroll to where the projects should be
    await scrollToSelector(page, '.projects, [id*="work"], [class*="work"], [id*="portfolio"], [class*="portfolio"], [id*="case"], [class*="case"]');
    
    // Find all project tiles/elements
    console.log('Finding project elements...');
    
    // Find elements that might be project tiles (adjust selectors based on actual website structure)
    const projectElements = await page.evaluate(() => {
      // Try different strategies to find project elements
      
      // Strategy 1: Look for common gallery/portfolio item patterns
      let elements = Array.from(document.querySelectorAll('.gallery-item, .portfolio-item, .project-item, .work-item'));
      
      // Strategy 2: Look for a grid or container with similar children
      if (elements.length === 0) {
        const grids = document.querySelectorAll('.grid, .projects-grid, .portfolio-grid, .work-grid');
        for (const grid of grids) {
          const children = Array.from(grid.children);
          if (children.length > 3) { // Assume it's a project grid if it has several children
            elements = children;
            break;
          }
        }
      }
      
      // Strategy 3: Look for images within a section near work heading
      if (elements.length === 0) {
        const workHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const workHeading = workHeadings.find(el => 
          el.textContent.toLowerCase().includes('work') || 
          el.textContent.toLowerCase().includes('our work')
        );
        
        if (workHeading) {
          // Try to find the parent section or container
          let container = workHeading.parentElement;
          for (let i = 0; i < 3 && container; i++) { // Check up to 3 levels up
            const projectItems = container.querySelectorAll('a, div, article');
            if (projectItems.length > 3) {
              elements = Array.from(projectItems);
              break;
            }
            container = container.parentElement;
          }
        }
      }
      
      // Strategy 4: Look for anything with a background image
      if (elements.length === 0) {
        elements = Array.from(document.querySelectorAll('[style*="background-image"]'));
      }
      
      // Return the positions of these elements for hovering
      return elements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2
        };
      });
    });
    
    // Log the project count and prepare to scrape each one
    console.log(`Found ${projectElements.length} potential project elements`);
    
    // Take a screenshot of the project section
    await page.screenshot({ path: path.join(__dirname, '../data/projects-section.png') });
    
    // Optional: Pause for manual inspection (set to true to enable)
    const enableManualInspection = true;
    if (enableManualInspection) {
      console.log('\n*******************************************************');
      console.log('* MANUAL INSPECTION MODE ENABLED                      *');
      console.log('* Browser window will stay open for 30 seconds        *');
      console.log('* You can manually inspect the page structure         *');
      console.log('* Check the console for more debug information        *');
      console.log('*******************************************************\n');
      
      await delay(30000); // Wait 30 seconds for manual inspection
    }
    
    // If no elements found with previous methods, try a more general approach based on the structure analysis
    if (projectElements.length === 0) {
      console.log('Trying alternative approach to find project elements...');
      
      // Use the structure analysis to look for potential project elements
      projectElements = await page.evaluate((pageStructure) => {
        const potentialElements = [];
        
        // Check if we have identified any potential galleries from the analysis
        if (pageStructure.potentialGalleries.length > 0) {
          for (const gallery of pageStructure.potentialGalleries) {
            if (gallery.childCount > 2) { // A gallery should have multiple items
              // Find the actual element using class or id
              let galleryElement;
              if (gallery.id) {
                galleryElement = document.getElementById(gallery.id);
              } else if (gallery.classes.length > 0) {
                const selector = '.' + gallery.classes.join('.');
                galleryElement = document.querySelector(selector);
              }
              
              if (galleryElement) {
                // Get all child elements that could be project items
                Array.from(galleryElement.children).forEach(child => {
                  if (child.offsetWidth > 100 && child.offsetHeight > 100) {
                    const rect = child.getBoundingClientRect();
                    potentialElements.push({
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                      width: rect.width,
                      height: rect.height,
                      source: 'gallery-child'
                    });
                  }
                });
              }
            }
          }
        }
        
        // If still no elements, look at the interactive elements from the analysis
        if (potentialElements.length === 0) {
          for (const element of pageStructure.interactiveElements) {
            if (element.hasImage || element.hasBgImage) {
              // Find the actual element
              let selector = element.tagName.toLowerCase();
              if (element.classes.length > 0) {
                selector += '.' + element.classes.join('.');
              }
              
              const interactiveElement = document.querySelector(selector);
              if (interactiveElement) {
                const rect = interactiveElement.getBoundingClientRect();
                potentialElements.push({
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                  width: rect.width,
                  height: rect.height,
                  source: 'interactive-element'
                });
              }
            }
          }
        }
        
        return potentialElements;
      }, pageStructure);
      
      console.log(`Found ${projectElements.length} potential project elements using alternative approach`);
    }
    
    // Hover over each project element to extract information
    const projectData = [];
    
    for (let i = 0; i < projectElements.length; i++) {
      console.log(`Processing project ${i + 1}/${projectElements.length}...`);
      
      try {
        // Hover over the project element
        await page.mouse.move(projectElements[i].x, projectElements[i].y);
        
        // Wait for any hover animations to complete
        await delay(2000);
        
        // Take a screenshot of the hover state
        await page.screenshot({ 
          path: path.join(__dirname, `../data/project-hover-${i + 1}.png`) 
        });
        
        // Try to find the details container (adjust selectors based on actual website structure)
        const projectInfo = await page.evaluate(() => {
          // Look for any visible details element with title content
          const detailsElements = document.querySelectorAll('.details, .project-details, .hover-details, .info, .overlay-text, .caption');
          let detailsElement = null;
          
          for (const el of detailsElements) {
            // Check if element is visible
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
              detailsElement = el;
              break;
            }
          }
          
          if (!detailsElement) return null;
          
          // Extract title from any heading or element with 'title' class
          let title = '';
          const titleElement = detailsElement.querySelector('.title, h1, h2, h3, h4, h5, h6');
          if (titleElement) {
            title = titleElement.textContent.trim();
          }
          
          // Extract subtitle/description from any paragraph or element with description-related class
          let subtitle = '';
          const descElement = detailsElement.querySelector('.desc, .description, p, .subtitle, .caption');
          if (descElement && descElement !== titleElement) {
            subtitle = descElement.textContent.trim();
          }
          
          return { title, subtitle };
        });
        
        if (projectInfo && projectInfo.title) {
          console.log(`Found project: ${projectInfo.title} - ${projectInfo.subtitle}`);
          projectData.push(projectInfo);
        }
      } catch (error) {
        console.error(`Error processing project ${i + 1}:`, error);
      }
    }
    
    // Save the scraped data
    const outputPath = path.join(__dirname, '../data/project-info.json');
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(projectData, null, 2));
    console.log(`Saved project data to ${outputPath}`);
    
    return projectData;
  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    // Capture a screenshot for debugging
    await page.screenshot({ path: path.join(__dirname, '../data/scrape-screenshot.png') });
    
    // Close the browser
    await browser.close();
    console.log('Browser closed');
  }
}

// Check if Puppeteer is installed
async function checkPuppeteer() {
  try {
    // If importing succeeded, Puppeteer is installed
    console.log('Puppeteer is installed and ready to use.');
    return true;
  } catch (error) {
    console.error('Puppeteer is not installed. Please run: npm install puppeteer');
    return false;
  }
}

// Main function
async function main() {
  const isPuppeteerInstalled = await checkPuppeteer();
  
  if (!isPuppeteerInstalled) {
    console.log('Installing Puppeteer...');
    // This isn't actually installing puppeteer, just informing the user
    console.log('Please run the following command to install Puppeteer:');
    console.log('npm install puppeteer');
    return;
  }
  
  const projectData = await scrapeProjectInfo();
  
  if (projectData && projectData.length > 0) {
    console.log('\nFound the following projects:');
    projectData.forEach((project, index) => {
      console.log(`${index + 1}. ${project.title} - ${project.subtitle}`);
    });
  } else {
    console.log('No project data was found. Try adjusting the selectors in the script.');
  }
}

main().catch(console.error); 