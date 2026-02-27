import React, { useState } from 'react';
import './ProfileImage.css';

const ProfileImage = ({ imageUrl, name, size = 40 }) => {
  const [imageError, setImageError] = useState(false);
  
  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080';
    return `${baseUrl}${url}`;
  };

  const fullImageUrl = getFullImageUrl(imageUrl);
  const initial = name?.charAt(0)?.toUpperCase() || '?';

  if (!fullImageUrl || imageError) {
    return (
      <div 
        className="profile-image-placeholder"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          backgroundColor: '#3498db',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={fullImageUrl}
      alt={name}
      onError={() => setImageError(true)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover'
      }}
    />
  );
};

export default ProfileImage;