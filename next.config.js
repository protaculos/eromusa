/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lf-storage-pull-zone.b-cdn.net",
      },
    ],
  },
};

module.exports = nextConfig;