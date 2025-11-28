import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/lib/types/project';
import { CBRECard } from '@/components/cbre/cbre-card';

interface ProjectTileProps {
  project: Project;
}

export function ProjectTile({ project }: ProjectTileProps) {
  const imageUrl = project.bannerImage || '/placeholder-project.jpg';

  return (
    <Link href={`/wolf-studio/our-work/${project.slug}`} className="project-tile-link">
      <CBRECard className="project-tile">
        <div className="image-container">
          <Image
            src={imageUrl}
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
      </CBRECard>
    </Link>
  );
} 