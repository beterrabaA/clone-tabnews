/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/*": ["./infra/migrations/**/*"],
  },
};

export default nextConfig;
