'use client';

import React from 'react';
import Image from 'next/image';

interface BackgroundLogoProps {
  opacity?: number;
}

const BackgroundLogo: React.FC<BackgroundLogoProps> = ({ 
  opacity = 0.1 
}) => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center"
      style={{
        opacity: opacity,
      }}
    >
      <div className="relative w-full h-full">
        <Image
          src="/images/olimpoBlanco.jpeg"
          alt="Olimpo Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    </div>
  );
};

export default BackgroundLogo;
