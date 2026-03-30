import React from 'react';

/**
 * Plexus Automotive Small Logo
 * Used when the drawer/sidebar is collapsed.
 */
export default function LogoIcon() {
  return (
    <img 
      src="/assets/images/logo.png" 
      alt="Plexus Icon" 
      width="100" 
      style={{ 
        maxWidth: '100%', 
        height: 'auto',
        objectFit: 'contain'
      }} 
    />
  );
}
