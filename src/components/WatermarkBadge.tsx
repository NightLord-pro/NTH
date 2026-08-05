import React, { useState, useEffect } from 'react';

interface WatermarkBadgeProps {
  image?: string;
  text?: string;
}

export const WatermarkBadge: React.FC<WatermarkBadgeProps> = ({
  image,
  text = 'Made by NightLord',
}) => {
  const defaultImage = 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L';

  const [watermarkImage, setWatermarkImage] = useState<string>(() => {
    return image || localStorage.getItem('customWatermark') || defaultImage;
  });

  useEffect(() => {
    if (image) {
      setWatermarkImage(image);
      localStorage.setItem('customWatermark', image);
    }
  }, [image]);

  const displayImage = watermarkImage || defaultImage;
  const displayText = text || 'Made by NightLord';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(12px)',
        padding: '8px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(168, 85, 247, 0.25)',
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
      className="transition-all hover:scale-105 select-none"
    >
      <img
        src={displayImage}
        alt="Watermark"
        style={{
          width: '26px',
          height: '26px',
          objectFit: 'contain',
        }}
        onError={(e) => {
          // Fallback if image link fails
          (e.target as HTMLImageElement).src = defaultImage;
        }}
      />
      <span
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#ffffff',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          letterSpacing: '0.02em',
        }}
      >
        {displayText}
      </span>
    </div>
  );
};
