/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'randomuser.me',
            // port: '',
            // pathname: '/account123/**',
          },
        ],
      },
    // reactStrictMode: false
};

export default nextConfig;
