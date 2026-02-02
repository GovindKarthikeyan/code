/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['applicationinsights', 'pino', 'pino-pretty'],
  productionBrowserSourceMaps: true,
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, net: false, tls: false, dns: false, child_process: false,
        stream: false, http: false, https: false, zlib: false, path: false, os: false, crypto: false,
      };
    }
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^applicationinsights$/, contextRegExp: /./ }));
    return config;
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    }];
  },
  logging: { fetches: { fullUrl: true } },
};
export default nextConfig;
