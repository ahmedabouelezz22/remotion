/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // المشروع يقع داخل مستودع أكبر له ملف قفل خاص به؛ نثبّت جذر التتبّع هنا
  outputFileTracingRoot: import.meta.dirname,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'horizons-cdn.hostinger.com' },
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
