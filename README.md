# WOLF Studio

Modern website for WOLF Studio - a design and workplace consultancy firm.

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
   npm install
   ```

3. Run the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

- `/app`: Next.js app directory with all pages and components
  - `/wolf-studio`: Main website pages
  - `/wolf-studio/our-work`: Portfolio of projects
- `/components`: Reusable UI components built with CBRE design system
- `/public`: Static assets including images and fonts
- `/data`: JSON data files for project information
- `/config`: Configuration files including theme and styling
- `/docs`: Documentation for project organization
- `/templates`: Template files for creating new project pages

## Project Pages

The site includes portfolio pages for various clients including:

- Management Consulting Firms (Taipei, Singapore, Global)
- Financial Services (Swiss Bank, RQAM, Lufax, MYP)
- Healthcare (IHH Healthcare, Iqvia, Bayer, Life Science Manufacturer)
- Technology (Ride Hailing Giant, Dassault Systemes)
- Corporate Offices (CBRE, Bosch, Emerson, Goodpack, Philip Morris)
- Hospitality (Homeaway, Heineken, Hans im Glück)
- Legal (International Law Firm)
- The WOLF Den (Company's own office)

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
```

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with CBRE design system
- **Components**: Custom CBRE components built on Radix UI
- **TypeScript**: Full TypeScript support
- **Fonts**: Custom fonts (Financier Display, Calibre)

## Adding New Projects

1. Add project data to `/data/projects.ts`
2. Create project page using the template in `/templates/project-page-template.tsx`
3. Add project images to `/public/scraped-images/work-projects/{project-id}/`
4. Follow the image naming convention: `{project-id}-banner.jpg` and `{project-id}-gallery-*.jpg`

See `/docs/image-organization.md` for detailed guidelines.

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

### Manual Deployment

For deployment to other platforms:

1. Build the project
   ```bash
   npm run build
   ```

2. The built application will be in the `.next` directory
3. Deploy the contents according to your hosting provider's instructions

## Design System

The website uses the CBRE design system with:
- **Colors**: CBRE green, accent green, and supporting palette
- **Typography**: Financier Display for headings, Calibre for body text
- **Components**: Consistent UI components following CBRE brand guidelines

## Contributing

When contributing to this project:

1. Follow the existing code style and component patterns
2. Use the CBRE design system components
3. Add new projects using the provided template
4. Update documentation as needed
5. Test your changes thoroughly

## License

MIT License - see the LICENSE file for details.