import React, { createContext, useContext, useEffect, useState } from 'react';

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch('https://beacon-92324875.base44.app/functions/getHubConfig');
        const data = await response.json();
        const colors = data?.data?.config?.branding || {};
        
        setBranding(colors);
        
        // Apply colors as CSS variables
        if (colors.brand_primary_color) {
          document.documentElement.style.setProperty('--primary-brand', colors.brand_primary_color);
        }
        if (colors.brand_secondary_color) {
          document.documentElement.style.setProperty('--secondary-brand', colors.brand_secondary_color);
        }
      } catch (error) {
        console.error('Failed to fetch branding config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
}