import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BlogSearchProps {
  onSearch: (term: string) => void;
}

const BlogSearch: React.FC<BlogSearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-lg mx-auto mb-8" dir={currentLanguage === 'en' ? 'ltr' : 'rtl'}>
      <div className="relative">
        <div className={`absolute inset-y-0 ${currentLanguage === 'en' ? 'left-0' : 'right-0'} flex items-center ${currentLanguage === 'en' ? 'pl-3' : 'pr-3'} pointer-events-none`}>
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className={`w-full p-3 ${currentLanguage === 'en' ? 'pl-10' : 'pr-10'} bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentLanguage === 'ar' ? 'text-right' : ''}`}
          placeholder={currentLanguage === 'en' ? "Search articles..." : "البحث في المقالات..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className={`absolute inset-y-0 ${currentLanguage === 'en' ? 'right-12' : 'left-12'} flex items-center ${currentLanguage === 'en' ? 'pr-3' : 'pl-3'}`}
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        <button
          type="submit"
          className={`absolute ${currentLanguage === 'en' ? 'right-0 rounded-r-lg' : 'left-0 rounded-l-lg'} top-0 h-full px-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors`}
        >
          {currentLanguage === 'en' ? 'Search' : 'بحث'}
        </button>
      </div>
    </form>
  );
};

export default BlogSearch;