/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove deprecated appDir configuration

  // API 프록시 설정 - 프론트엔드와 백엔드를 same-origin으로 처리
  async rewrites() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const apiUrl = isDevelopment
      ? 'http://localhost:4000'  // 개발 환경
      : process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.example.com'  // 프로덕션 환경

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`
      }
    ]
  },

  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // CSP (Content Security Policy)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:4000 ws://localhost:4000 http://192.168.0.9:4000 ws://192.168.0.9:4000",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig