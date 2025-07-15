import { Project } from '@/lib/types/project';
import { ProjectTile } from './ProjectTile';

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