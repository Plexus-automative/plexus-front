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
    NEXT_APP_VERSION: 'v4.0.0',
    // ONLY put non-sensitive public env variables here
    NEXT_APP_API_URL: 'https://mock-data-api-nextjs.vercel.app',
  },
  outputFileTracingRoot: path.join(__dirname, './'),
  
  eslint: {
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig;