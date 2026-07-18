export const DEFAULT_COACH_IMAGE = "/images/coaches/WalsBi0.png";

export function coachImagePath(coachID: string): string {
  return `/images/coaches/${coachID}.png`;
}

export function imgPath(folder: string, abbrev: string, _year?: number) {
  // Logo assets in /public/images/nfl are only available for 2024.
  const logoYear = 2024;
  return `/images/${folder}/${abbrev.toLowerCase()}-${logoYear}.png`;
}

export function hexToRgba(hex: string, transparency = 0.2) {
  hex = hex.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${transparency})`;
}
