/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  env: {
    APP_ENV: process.env.NODE_ENV,
  },
  // Autres configurations...
};

module.exports = nextConfig;
