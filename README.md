# WOLF Studio

Website for WOLF Studio - a design and workplace consultancy firm.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm (v9 or later recommended)
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/rizkinov/wolf-studio.git
   cd wolf-studio
   ```

2. Install dependencies
   ```bash
   npm install --legacy-peer-deps
   ```
   
   > Note: We use `--legacy-peer-deps` flag due to some package compatibility requirements.

3. Run the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

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

This is a Next.js project. Available commands:

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint the codebase
npm run lint

# Clean build files
npm run clean
```

## Deployment

### Deploying to Vercel (Recommended)

The easiest way to deploy this site is using Vercel:

1. Create an account on [Vercel](https://vercel.com) if you don't have one
2. Fork or clone this repository to your GitHub account
3. Import the project in Vercel:
   - Connect your GitHub account
   - Select the repository
   - Vercel will automatically detect the Next.js project and set up appropriate build settings
4. Click "Deploy" and wait for the build to complete

The site automatically uses the following build configuration from `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "CI=true npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Manual Deployment

For deployment to other platforms:

1. Build the project
   ```bash
   npm run clean
   npm run build
   ```

2. The built application will be in the `.next` directory
3. Deploy the contents according to your hosting provider's instructions

### GitHub Setup

To deploy the repository to GitHub:

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

## Image Structure

Before deployment, make sure to add project images to:

```
/public/scraped-images/work-projects/{projectname}/
```

Each project needs:
- A banner image: `{projectname}-banner.jpg`
- Gallery images: `{projectname}-gallery-1.jpg`, `{projectname}-gallery-2.jpg`, etc.

Detailed documentation on image organization can be found in `docs/image-organization.md`.

### Image Management Tools

The repository includes several scripts to help manage project images:
- `scripts/organize-images.sh`: Script to copy images from old locations to the standardized structure
- `scripts/update-project-paths.cjs`: Script to update image paths in projects.ts
- `scripts/update-project-pages.cjs`: Script to update image paths in project page files
- `scripts/fix-gallery-brackets.cjs`: Script to fix syntax issues in gallery image arrays

When adding new projects, use the template provided in `templates/project-page-template.tsx` to ensure consistency.

## Environment Configuration

The project uses Next.js environment variables. Create a `.env.local` file in the root directory:

```
# Example environment variables (replace with your actual values)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.