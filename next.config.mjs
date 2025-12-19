/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['upeoxmwdwghdbgcqqtll.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/places/photo',
      },
      {
        pathname: '/brand/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  productionBrowserSourceMaps: true,
};

export default nextConfig;

