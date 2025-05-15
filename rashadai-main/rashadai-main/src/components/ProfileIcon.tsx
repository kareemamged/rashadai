import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, LogOut, Settings, MessageSquare, Bookmark } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../store/languageStore';

interface ProfileIconProps {
  onSignOut: () => void;
  showName?: boolean;
  countryFlag?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ onSignOut, showName = false, countryFlag }) => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isRtl = language === 'ar';

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={profileMenuRef}>
      <button
        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
        className="flex items-center space-x-2 rounded-full hover:bg-gray-100 p-1 transition-colors"
        aria-label="Open profile menu"
        aria-expanded={isProfileMenuOpen}
      >
        {showName && (
          <div className={`flex items-center ${isRtl ? 'space-x-reverse mr-2' : 'space-x-2 ml-2'}`}>
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {user.name || user.email.split('@')[0]}
            </span>
            {countryFlag && (
              <span className="text-sm hidden md:block">{countryFlag}</span>
            )}
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        )}
        <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-200">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User profile'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-blue-100 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
          )}
        </div>
      </button>

      {isProfileMenuOpen && (
        <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200`}>
          <div className="px-4 py-3 border-b border-gray-100">
            <p className={`text-sm font-medium text-gray-900 ${isRtl ? 'text-right' : ''}`}>
              {user.name || user.email.split('@')[0]}
            </p>
            <p className={`text-sm text-gray-500 truncate ${isRtl ? 'text-right' : ''}`}>
              {user.email}
            </p>
          </div>
          <Link
            to="/profile"
            className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isRtl ? 'text-right' : ''}`}
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <User className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {t('header.profile')}
          </Link>
          <Link
            to="/settings"
            className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isRtl ? 'text-right' : ''}`}
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <Settings className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {t('header.settings')}
          </Link>
          <Link
            to="/chat-history"
            className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isRtl ? 'text-right' : ''}`}
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <MessageSquare className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {t('header.chatHistory')}
          </Link>
          <Link
            to="/saved-messages"
            className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isRtl ? 'text-right' : ''}`}
            onClick={() => setIsProfileMenuOpen(false)}
          >
            <Bookmark className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {isRtl ? 'الرسائل المحفوظة' : 'Saved Messages'}
          </Link>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => {
              onSignOut();
              setIsProfileMenuOpen(false);
            }}
            className={`flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 ${isRtl ? 'text-right' : ''}`}
          >
            <LogOut className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {t('header.logout')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;
