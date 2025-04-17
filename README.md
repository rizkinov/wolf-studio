# WOLF Studio

Modern website for WOLF Studio - a design and workplace consultancy firm.

## Project Structure

- `/app`: Next.js app directory with all pages and components
  - `/wolf-studio`: Main website pages
  - `/wolf-studio/our-work`: Portfolio of projects
- `/components`: Reusable UI components
- `/public`: Static assets including images and fonts
- `/data`: JSON data files for project information
- `/scripts`: Utility scripts for content management

## Project Pages

The site includes portfolio pages for various clients including:

- IHH
- Philip Morris Singapore
- Management Consulting SG
- Taipei Management
- Swiss Bank
- HomeAway
- Singapore Management
- Heineken
- Ride Hailing Giant
- Global Consulting Giant
- Emerson
- The WOLF den

## Development

This is a Next.js project. To run it locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

This repository can be deployed to GitHub Pages or any other hosting service that supports Next.js applications.

```bash
# Clean existing build files
npm run clean

# Build for production
npm run build
```

## Image Structure

Before deployment, make sure to add project images to:

```
/public/scraped-images/work-projects/{projectname}/
```

Each project needs:
- A banner image: `{projectname}-banner.jpg`
- Gallery images: `{projectname}-gallery-1.jpg`, `{projectname}-gallery-2.jpg`, etc.

## GitHub Setup

To deploy this repository to GitHub:

1. Create a new repository named `wolf-studio` on GitHub
2. Initialize git in this directory (if not already done)
   ```bash
   git init
   ```
3. Add the remote repository
   ```bash
   git remote add origin https://github.com/yourusername/wolf-studio.git
   ```
4. Add all files
   ```bash
   git add .
   ```
5. Commit the changes
   ```bash
   git commit -m "Initial commit of WOLF Studio website"
   ```
6. Push to GitHub
   ```bash
   git push -u origin main
   ``` 