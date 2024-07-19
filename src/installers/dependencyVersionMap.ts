/*
 * This maps the necessary packages to a version.
 * This improves performance significantly over fetching it from the npm registry.
 */
export const dependencyVersionMap = {
  // TailwindCSS
  tailwindcss: "^3.4.3",
  postcss: "^8.4.39",
  prettier: "^3.3.2",
  "prettier-plugin-tailwindcss": "^0.6.5",
} as const;
export type AvailableDependencies = keyof typeof dependencyVersionMap;
