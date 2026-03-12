/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ تحذير: هذا يسمح بعمل build حتى لو كان هناك أخطاء TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // يتجاهل أخطاء ESLint أثناء البناء
    ignoreDuringBuilds: true,
  },
  images: {
    domains:['res.cloudinary.com'], // السماح بصور كلاوديناري
  }
}

module.exports = nextConfig;