import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force transpilation of font package
  transpilePackages: ['next/font'],
  
  // Experimental features for better font handling
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@shadcn/ui']
  },
  
  // Turbopack configuration
  turbopack: {},
  
  // Proper font configuration for Turbopack
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Allow cross-origin requests for development
  allowedDevOrigins: ['192.168.1.108', 'localhost:3000', '172.16.0.2:3000'],
};

export default nextConfig;
