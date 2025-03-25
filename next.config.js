/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  transpilePackages: ['react-qr-scanner', 'react-quill'],
  experimental: {
    forceSwcTransforms: true,
    esmExternals: 'loose'
  },
  webpack: (config) => {
    // Resolver problemas con alias para módulos problemáticos
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  output: "standalone",
};

module.exports = nextConfig;