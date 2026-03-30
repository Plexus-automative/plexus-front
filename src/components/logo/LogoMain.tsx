import React from 'react';

/**
 * Plexus Automotive Main Logo
 * This component is used in the sidebar and header.
 */
export default function LogoMain({ reverse }: { reverse?: boolean }) {
  return (
    <img 
      src="/assets/images/logo.png" 
      alt="Plexus Automotive" 
      width="135" 
      style={{ 
        maxWidth: '100%', 
        height: 'auto',
        filter: reverse ? 'brightness(0) invert(1)' : 'none' 
      }} 
    />
  );
}