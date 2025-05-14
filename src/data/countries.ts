export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const countries: Country[] = [
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
];

export const getCountryByCode = (code: string): Country | undefined => {
  console.log('Getting country for code:', code);
  const country = countries.find(country => country.code === code);
  console.log('Found country:', country);
  return country;
};

export const getDefaultCountry = (): Country => {
  return countries.find(country => country.code === 'EG') || countries[0]; // Egypt as default country
};

/**
 * Get country name by country code
 * @param code - Country code (e.g., 'SA', 'US')
 * @returns Country name or the code if country not found
 */
export const getCountryNameByCode = (code: string): string => {
  if (!code) return '';

  const country = countries.find(country => country.code === code);
  return country ? country.name : code;
};
