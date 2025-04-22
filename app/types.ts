export interface Project {
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