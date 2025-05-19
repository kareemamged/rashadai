import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SiteImageProps {
  imageKey: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const SiteImage: React.FC<SiteImageProps> = ({
  imageKey,
  alt = '',
  className = '',
  fallbackSrc = '/images/defaults/image-error.png',
  onLoad,
  onError
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImageUrl = async () => {
      setLoading(true);
      setError(false);

      try {
        // Try to get the image URL from the database
        const { data, error } = await supabase
          .from('site_images')
          .select('image_url')
          .eq('key', imageKey)
          .single();

        if (error) {
          throw error;
        }

        if (data && data.image_url) {
          setImageUrl(data.image_url);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(`Error fetching image with key ${imageKey}:`, err);
        setError(true);
        if (onError) onError();
      } finally {
        setLoading(false);
      }
    };

    fetchImageUrl();
  }, [imageKey, onError]);

  const handleImageError = () => {
    setError(true);
    if (onError) onError();
  };

  const handleImageLoad = () => {
    if (onLoad) onLoad();
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="animate-pulse bg-gray-200 w-full h-full"></div>
      </div>
    );
  }

  return (
    <img
      src={error ? fallbackSrc : imageUrl || `https://placehold.co/600x400/blue/white?text=${imageKey}`}
      alt={alt}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
    />
  );
};

export default SiteImage;
