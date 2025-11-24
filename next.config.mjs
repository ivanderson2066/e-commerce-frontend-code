/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable production browser source maps to reduce map lookups.
  productionBrowserSourceMaps: false,
  // Next.js 16 usa Turbopack por padrão. Ter uma configuração `webpack` ativa
  // junto com Turbopack causa um erro em `next dev`. Para resolver sem forçar
  // flags na linha de comando, exponha uma config vazia de turbopack.
  // Caso precise de ajustes específicos no bundler, preferir migrar as
  // customizações para Turbopack ou usar `npm run dev -- --webpack`.
  turbopack: {},
}

export default nextConfig
