/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['upeoxmwdwghdbgcqqtll.supabase.co'],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;

