interface Window {
  siteName?: string;
  siteDescription?: string;
  systemSettings?: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportPhone: string;
    timezone?: string;
    dateFormat?: string;
    timeFormat?: string;
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      twitterCard?: string;
      twitterTitle?: string;
      twitterDescription?: string;
      twitterImage?: string;
      googleVerification?: string;
      bingVerification?: string;
      analyticsId?: string;
    };
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
      supportHours?: string;
    };
    security?: {
      enableTwoFactor: boolean;
      passwordPolicy: {
        minLength: number;
        requireSpecialChars: boolean;
        requireNumbers: boolean;
        requireUppercase: boolean;
      };
      maxLoginAttempts: number;
    };
    maintenance?: {
      enabled: boolean;
      message: string;
    };
    designSettings?: {
      logo?: string;
      favicon?: string;
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      fontHeading?: string;
      fontBody?: string;
      fontSize?: string;
    };
  };
  updateSEOTags?: (settings: any) => void;
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
}
