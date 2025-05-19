import React, { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';

// Extend Window interface to include siteName and designSettings
declare global {
  interface Window {
    siteName: string;
    designSettings?: {
      logo?: string;
      favicon?: string;
      siteName?: string;
    };
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { designSettings } = useAdminStore();

  useEffect(() => {
    // Apply theme colors to CSS variables
    const root = document.documentElement;

    // Set CSS variables for colors
    root.style.setProperty('--color-primary', designSettings.colors.primary);
    root.style.setProperty('--color-secondary', designSettings.colors.secondary);
    root.style.setProperty('--color-accent', designSettings.colors.accent);
    root.style.setProperty('--color-background', designSettings.colors.background);
    root.style.setProperty('--color-text', designSettings.colors.text);

    // Set CSS variables for fonts
    root.style.setProperty('--font-heading', designSettings.fonts.heading);
    root.style.setProperty('--font-body', designSettings.fonts.body);

    // Set font size variables
    root.style.setProperty('--font-size-small', '14px');
    root.style.setProperty('--font-size-medium', '16px');
    root.style.setProperty('--font-size-large', '18px');

    // Set base font size based on user selection
    let fontSize = '16px';
    if (designSettings.fonts.size === 'small') {
      fontSize = '14px';
    } else if (designSettings.fonts.size === 'large') {
      fontSize = '18px';
    }
    root.style.setProperty('--font-size-base', fontSize);

    // Apply font family to document
    document.body.style.fontFamily = designSettings.fonts.body;

    // Set favicon if available
    if (designSettings.favicon) {
      const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = designSettings.favicon;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'shortcut icon';
        newFavicon.href = designSettings.favicon;
        document.head.appendChild(newFavicon);
      }
    }

    // Set global variables for site settings
    window.siteName = designSettings.siteName;
    window.designSettings = {
      logo: designSettings.logo,
      favicon: designSettings.favicon,
      siteName: designSettings.siteName
    };
  }, [designSettings]);

  return <>{children}</>;
};

export default ThemeProvider;
