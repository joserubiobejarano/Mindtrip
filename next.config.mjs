/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase storage (your project)
      { protocol: "https", hostname: "upeoxmwdghdbgqcqtll.supabase.co" },

      // Google APIs + assets that commonly serve Places photos
      { protocol: "https", hostname: "maps.googleapis.com" },
      { protocol: "https", hostname: "places.googleapis.com" },
      { protocol: "https", hostname: "streetviewpixels-pa.googleapis.com" },

      // Google photo/CDN hosts
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lh4.googleusercontent.com" },
      { protocol: "https", hostname: "lh5.googleusercontent.com" },
      { protocol: "https", hostname: "lh6.googleusercontent.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },

      { protocol: "https", hostname: "maps.gstatic.com" },
      { protocol: "https", hostname: "**.gstatic.com" },

      // Unsplash fallback images
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    localPatterns: [
      { pathname: "/api/places/photo" },
      { pathname: "/brand/**" },
    ],
  },

  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },

  productionBrowserSourceMaps: true,
};

export default nextConfig;

