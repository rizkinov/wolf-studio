# Wolf Studio Works Landing Page Implementation Plan (Updated)

## Overview
This plan outlines the implementation of a responsive grid-based landing page for Wolf Studio's portfolio of works. The page will display projects as tiles in a 4-column grid (on wide screens), with hover effects and CMS-ready architecture. **The implementation will leverage existing CBRE components where appropriate.**

## Current Progress: Planning Stage
- [x] Created initial plan
- [x] Defined data structure for projects
- [x] Outlined component architecture 
- [x] Defined styling approach with hover effects
- [x] **Identified CBRE components to incorporate**
- [ ] Implemented page component
- [ ] Implemented grid component
- [ ] Implemented tile component
- [ ] Applied styles and responsive behavior
- [ ] Connected with data source
- [ ] Tested across devices

## 1. CBRE Component Integration

### Identifying Relevant CBRE Components
```typescript
// Components to import from the CBRE library
import { CBREButton } from '@/components/cbre-button';
import { CBREStyledCard } from '@/components/cbre-styled-card';
import { CBRELayout } from '@/components/cbre-layout'; // If available
import { CBREHeading } from '@/components/cbre-heading'; // If available
```

### Using CBRE Components
- Use `CBREStyledCard` for project tiles to maintain consistent styling
- Use `CBREButton` for any navigation or filtering actions
- Follow CBRE design system guidelines for spacing, typography, and colors
- Implement CBRE-consistent hover effects and animations

## 2. Data Structure & CMS Preparation

### Project Interface
```typescript
interface Project {
  id: string;            // Unique identifier
  title: string;         // Primary title (Financier Display font)
  subtitle?: string;     // Optional subtitle (Calibre Light font)
  slug: string;          // URL-friendly identifier for routing
  bannerImage: string;   // Image path for tile thumbnail
  order: number;         // For manual ordering on the grid
  featured?: boolean;    // Optional flag for featured projects
  category?: string;     // Optional category for filtering
  publishedAt: string;   // Date for sorting/filtering
}
```

### Static Data Example
```typescript
// File: /data/projects.ts
export const projectsData: Project[] = [
  {
    id: "managementconsultingfirm",
    title: "Taipei Management",
    subtitle: "Consulting firm",
    slug: "managementconsultingfirm",
    bannerImage: "/scraped-images/work-projects/management-consulting-firm/management-consulting-banner.jpg",
    order: 1,
    publishedAt: "2024-01-01"
  },
  // Additional projects following the specified order...
];
```

### Data Service Layer
```typescript
// File: /lib/project-service.ts
import { Project } from '@/types';
import { projectsData } from '@/data/projects';

export async function getProjects(): Promise<Project[]> {
  // In future: Replace with CMS API call
  // e.g. const res = await fetch(`${process.env.CMS_API_URL}/projects`);
  
  // For now, return static data sorted by order
  return projectsData.sort((a, b) => a.order - b.order);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  // In future: Fetch single project from CMS
  // For now, find in static data
  return projectsData.find(p => p.slug === slug) || null;
}
```

## 3. Component Architecture

### ProjectGrid Component
```typescript
// File: /components/ProjectGrid.tsx
import { Project } from '@/types';
import { ProjectTile } from './ProjectTile';
// Import any CBRE layout components if appropriate
// import { CBREGrid } from '@/components/cbre-grid'; // If available

interface ProjectGridProps {
  projects: Project[];
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
    widescreen: number;
  };
}

export function ProjectGrid({ 
  projects,
  columns = { mobile: 1, tablet: 2, desktop: 3, widescreen: 4 }
}: ProjectGridProps) {
  if (!projects?.length) {
    return <div className="empty-state">No projects found</div>;
  }

  // Use CBRE grid component if available, otherwise use our custom grid
  return (
    <div 
      className="projects-grid"
      style={{
        '--cols-mobile': columns.mobile,
        '--cols-tablet': columns.tablet,
        '--cols-desktop': columns.desktop,
        '--cols-wide': columns.widescreen
      } as React.CSSProperties}
    >
      {projects.map(project => (
        <ProjectTile key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### ProjectTile Component with CBREStyledCard
```typescript
// File: /components/ProjectTile.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/types';
import { CBREStyledCard } from '@/components/cbre-styled-card';

interface ProjectTileProps {
  project: Project;
}

export function ProjectTile({ project }: ProjectTileProps) {
  return (
    <Link href={`/wolf-studio/our-work/${project.slug}`} className="project-tile-link">
      <CBREStyledCard className="project-tile">
        <div className="image-container">
          <Image 
            src={project.bannerImage}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
          <div className="overlay"></div>
        </div>
        <div className="project-info">
          <h2 className="project-title">{project.title}</h2>
          {project.subtitle && (
            <p className="project-subtitle">{project.subtitle}</p>
          )}
        </div>
      </CBREStyledCard>
    </Link>
  );
}
```

## 4. Main Page Implementation

```typescript
// File: /app/wolf-studio/our-work/page.tsx
import { getProjects } from '@/lib/project-service';
import { ProjectGrid } from '@/components/ProjectGrid';
import { CBREHeading } from '@/components/cbre-heading'; // If available
import { CBRELayout } from '@/components/cbre-layout'; // If available

export default async function WorksPage() {
  const projects = await getProjects();
  
  // Use CBRE layout components if available
  return (
    <div className="projects-container">
      {/* Use CBRE heading component if available */}
      <h1 className="sr-only">Our Work</h1>
      <ProjectGrid projects={projects} />
    </div>
  );
}
```

## 5. CSS Implementation with CBRE Design System

```css
/* File: /styles/projects.css (or within a CSS module) */

/* Grid Layout - following CBRE design system spacing */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols-mobile, 1), 1fr);
  gap: var(--cbre-spacing-4, 1rem); /* Use CBRE spacing variables if available */
  width: 100%;
}

@media (min-width: 640px) {
  .projects-grid {
    grid-template-columns: repeat(var(--cols-tablet, 2), 1fr);
  }
}

@media (min-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(var(--cols-desktop, 3), 1fr);
  }
}

@media (min-width: 1280px) {
  .projects-grid {
    grid-template-columns: repeat(var(--cols-wide, 4), 1fr);
  }
}

/* Project Tiles - with CBRE styling */
.project-tile {
  position: relative;
  height: 0;
  padding-bottom: 75%; /* 4:3 aspect ratio */
  overflow: hidden;
  /* Use CBRE card styles as baseline, then override as needed */
}

.image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0);
  transition: background-color 0.4s ease;
}

.project-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: var(--cbre-spacing-8, 2rem); /* Use CBRE spacing variables */
  opacity: 0;
  transition: opacity 0.4s ease;
}

.project-title {
  font-family: 'Financier Display', serif; /* Maintain brand font */
  font-size: 1.5rem;
  color: var(--cbre-color-white, #ffffff); /* Use CBRE color variables */
  margin-bottom: 0.25rem;
}

.project-subtitle {
  font-family: 'Calibre Light', sans-serif; /* Maintain brand font */
  font-size: 1rem;
  color: var(--cbre-color-white, #ffffff); /* Use CBRE color variables */
}

/* Hover Effects - consistent with CBRE design system */
.project-tile:hover .image-container {
  transform: scale(1.05);
}

.project-tile:hover .overlay {
  background-color: rgba(255, 255, 255, 0.2);
}

.project-tile:hover .project-info {
  opacity: 1;
}
```

## 6. CBRE Design System Compliance

### Typography
- Use Financier Display for titles (as specified)
- Use Calibre Light for subtitles (as specified)
- Ensure these fonts are properly loaded or are part of the CBRE design system

### Colors
- Use CBRE color variables for text, backgrounds, and hover states
- Maintain brand consistency through the established color scheme

### Spacing
- Apply CBRE spacing standards for margins, padding, and grid gaps
- Ensure responsive behavior follows CBRE breakpoints

### Interaction Patterns
- Implement hover effects consistent with other CBRE interactive elements
- Use CBRE transition speeds and easing functions

## 7. Project Order

Below is the specified order for the projects to appear on the grid:

1. Taipei Management Consulting firm
2. Swiss Bank
3. Singapore Management Consulting Firm
4. Heineken
5. Ride Hailing Giant
6. Hong Kong Management Consulting Firm
7. Homeaway - A home from home
8. International Law Firm
9. IHH Healthcare - A workplace without boundaries
10. RQAM
11. Bosch
12. Global Consulting Giant - Professional Services Firm
13. EMERSON - Automation Specialists
14. CBRE
15. Goodpack
16. Philip Morris
17. Iqvia
18. Bayer
19. MYP - SGX-Listed Investment Firm
20. Life Science & Clinical Manufacturer
21. LUFAX - China's Fintech Giant
22. Zurich Insurance
23. The WOLF den - Where great design happens
24. Dassault Systemes - Global Leader in 3D Software
25. Resources - Bold and Professional
26. Rice Communications
27. VV Life
28. HANS IM GLUCK - German Burger Grill Orchard Road

## 8. Testing & Quality Assurance Plan

1. **Visual Testing**
   - Verify grid layout across all breakpoints
   - Confirm hover effects work as expected
   - Ensure text is readable against image backgrounds
   - Check image loading and rendering quality
   - **Verify consistency with other CBRE components**

2. **Functional Testing**
   - Confirm all links navigate to correct project pages
   - Test with both static and CMS data (when available)
   - Verify error handling for missing data
   - **Test integration with CBRE component behaviors**

3. **Performance Testing**
   - Optimize images (consider using Next.js Image component)
   - Implement lazy loading for below-fold images
   - Verify page load metrics (Core Web Vitals)

## 9. Next Steps

1. Implement the base ProjectGrid using CBRE layout patterns
2. Create ProjectTile component using CBREStyledCard
3. Set up the static data file with all project information
4. Create the main page layout and connect components
5. Add the CSS for grid layout and hover effects
6. Test across different screen sizes
7. Prepare CMS integration points

## Notes for Handover

- The design follows a 4-column grid on wide screens, adapting to fewer columns on smaller screens
- Each tile shows the project title and subtitle on hover, with a subtle zoom effect
- A light white overlay is applied on hover to improve text readability
- The component structure is designed to be CMS-ready with clear integration points
- Project data is structured with future content management in mind
- **All components adhere to the CBRE design system where applicable**
- **CBREStyledCard is used for project tiles to maintain design consistency**
- **CBREButton is used for navigation elements** 