-- Fix Charts Data
-- This populates the year field and marks some projects as featured

-- Update year field from published_at dates
UPDATE projects 
SET year = EXTRACT(YEAR FROM published_at)
WHERE published_at IS NOT NULL;

-- Mark some high-profile projects as featured
UPDATE projects 
SET featured = true
WHERE slug IN (
    'globalconsultinggiant',
    'swissbank', 
    'heineken',
    'ihh',
    'ridehailinggiant',
    'thewolfden',
    'cbre',
    'bayer'
);

-- Verify the changes
-- Check year distribution
SELECT 
    year,
    COUNT(*) as project_count
FROM projects 
WHERE year IS NOT NULL
GROUP BY year
ORDER BY year DESC;

-- Check featured projects count
SELECT 
    COUNT(*) as featured_project_count
FROM projects 
WHERE featured = true; 