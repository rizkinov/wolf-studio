#!/bin/bash

# Script to standardize project image organization
# This script helps reorganize image files from the current inconsistent patterns
# to the recommended pattern in the README:
# /public/scraped-images/work-projects/{projectname}/{projectname}-banner.jpg
# /public/scraped-images/work-projects/{projectname}/{projectname}-gallery-1.jpg

# List of project IDs
projects=(
  "managementconsultingfirm"
  "swissbank"
  "managementconsultingsg"
  "heineken"
  "ridehailinggiant"
  "hongkongmanagement"
  "homeaway"
  "internationallawfirm"
  "ihh"
  "rqam"
  "bosch"
  "globalconsultinggiant"
  "emerson"
  "cbre"
  "goodpack"
  "philipmorrissingapore"
  "iqvia"
  "bayer"
  "myp"
  "lifesciencemanufacturer"
  "lufax"
  "zurichinsurance"
  "thewolfden"
  "dassaultsystemes"
  "resources"
  "ricecommunications"
  "vvlife"
  "hansimgluck"
)

# Create the target directory if it doesn't exist
mkdir -p public/scraped-images/work-projects

for project in "${projects[@]}"; do
  echo "Processing $project..."
  
  # Create project directory
  mkdir -p "public/scraped-images/work-projects/$project"
  
  # Check for banner image in old location
  if [ -f "public/wolf-studio/our-work/$project/banner.jpg" ]; then
    echo "  - Moving banner image for $project"
    cp "public/wolf-studio/our-work/$project/banner.jpg" "public/scraped-images/work-projects/$project/$project-banner.jpg"
  fi
  
  # Find all jpg files in the project directory that aren't banner.jpg
  if [ -d "public/wolf-studio/our-work/$project" ]; then
    gallery_files=($(find "public/wolf-studio/our-work/$project" -type f -name "*.jpg" -not -name "banner.jpg"))
    
    # Copy each gallery image with proper naming
    for i in "${!gallery_files[@]}"; do
      file="${gallery_files[$i]}"
      echo "  - Moving gallery image $(basename "$file") to $project-gallery-$((i+1)).jpg"
      cp "$file" "public/scraped-images/work-projects/$project/$project-gallery-$((i+1)).jpg"
    done
  fi
done

echo "Image reorganization complete."
echo "Next steps:"
echo "1. Update all project page files to use the new image paths"
echo "2. Update the projects.ts file to use the new banner image paths"
echo "3. Once confirmed working, you can remove the old image files" 