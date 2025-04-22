/**
 * Navigation Utilities for Wolf Studio
 */

/**
 * Navigate to a specific section on the home page
 * 
 * @param sectionId The ID of the section to navigate to (without the # symbol)
 * @returns A URL string that will navigate to the section
 */
export const navigateToSection = (sectionId: string): string => {
  return `/wolf-studio/#${sectionId}`;
};

/**
 * Navigate to the "Our Work" section on the home page
 * 
 * @returns A URL string that will navigate to the "Our Work" section
 */
export const navigateToOurWork = (): string => {
  return navigateToSection('our-work');
}; 