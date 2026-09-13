import path from 'path';
import type { NextConfig } from 'next';

// dev 从项目根启动，以 cwd 锚定项目根，避免系统根目录 / 的平台注入 package.json 误导 Turbopack workspace root
const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site', 'localhost', '127.0.0.1'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
