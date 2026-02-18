/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}'
    },
    '@mui/lab': {
      transform: '@mui/lab/{{member}}'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '**'
      }
    ]
  },
  env: {
    TOKEN: process.env.TOKEN,
    NEXT_API_PLEXUS: process.env.NEXT_API_PLEXUS,
    NEXT_APP_VERSION: 'v4.0.0',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_APP_GOOGLE_MAPS_API_KEY: process.env.NEXT_APP_GOOGLE_MAPS_API_KEY,
    NEXT_APP_MAPBOX_ACCESS_TOKEN: process.env.NEXT_APP_MAPBOX_ACCESS_TOKEN,
    NEXT_APP_API_URL: process.env.NEXT_APP_API_URL,
    NEXT_APP_JWT_SECRET: process.env.NEXT_APP_JWT_SECRET,
    NEXT_APP_JWT_TIMEOUT: process.env.NEXT_APP_JWT_TIMEOUT,
    NEXTAUTH_SECRET_KEY: process.env.NEXTAUTH_SECRET_KEY
  },
  outputFileTracingRoot: path.join(__dirname, './')
};

module.exports = nextConfig;
