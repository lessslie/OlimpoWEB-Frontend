/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "production"
            ? "https://olimpoweb-backend.onrender.com/api/:path*"
            : "http://localhost:3005/api/:path*",
      },
    ];
  },
  // Configuración para evitar problemas con dependencias específicas de Windows
  webpack: (config, { isServer }) => {
    // Evitar incluir dependencias específicas de plataforma
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }

    // Agregar transpilación para módulos específicos que están causando problemas
    config.module.rules.push({
      test: /node_modules\/(react-qr-scanner|react-quill)/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["next/babel"],
          plugins: [
            [
              "@babel/plugin-transform-runtime",
              {
                corejs: 3,
                helpers: true,
                regenerator: true,
                useESModules: false,
              },
            ],
          ],
        },
      },
    });

    return config;
  },
  // Especificar explícitamente los paquetes que necesitan transpilación
  transpilePackages: ["react-qr-scanner", "react-quill"],
  // Configuración para manejar correctamente las rutas en Vercel
  trailingSlash: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  // Configuración para permitir imágenes externas
  images: {
    domains: ["images.unsplash.com", "via.placeholder.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Asegurarse de que la aplicación funcione correctamente en Vercel
  output: "standalone",
};

module.exports = nextConfig;
