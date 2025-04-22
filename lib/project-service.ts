import { Project } from '@/app/types';
import { projectsData } from '../data/projects';

/**
 * Get all projects, sorted by order property
 * In the future, this would be replaced with a CMS API call
 */
export async function getProjects(): Promise<Project[]> {
  // In future: Replace with CMS API call
  // e.g. const res = await fetch(`${process.env.CMS_API_URL}/projects`);
  
  // For now, return static data sorted by order
  return projectsData.sort((a: Project, b: Project) => a.order - b.order);
}

/**
 * Get a single project by its slug
 * In the future, this would be replaced with a CMS API call
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  // In future: Fetch single project from CMS
  // For now, find in static data
  return projectsData.find((p: Project) => p.slug === slug) || null;
} 