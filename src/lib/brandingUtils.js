/**
 * Converts hex color to RGB values
 * @param {string} hex - Hex color code (#RRGGBB)
 * @returns {string} - CSS rgb(r, g, b) string
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}

/**
 * Apply brand colors to CSS variables
 * @param {Object} branding - Branding config object
 */
export function applyBrandingColors(branding) {
  const root = document.documentElement;
  
  if (branding.brand_primary_color) {
    const primaryRgb = hexToRgb(branding.brand_primary_color);
    if (primaryRgb) {
      root.style.setProperty('--primary-brand-rgb', primaryRgb);
    }
    root.style.setProperty('--primary-brand', branding.brand_primary_color);
  }
  
  if (branding.brand_secondary_color) {
    const secondaryRgb = hexToRgb(branding.brand_secondary_color);
    if (secondaryRgb) {
      root.style.setProperty('--secondary-brand-rgb', secondaryRgb);
    }
    root.style.setProperty('--secondary-brand', branding.brand_secondary_color);
  }
}