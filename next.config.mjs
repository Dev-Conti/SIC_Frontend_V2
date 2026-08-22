import withMDX from '@next/mdx';

// Rotas de entrada (acessadas diretamente por usuários, não só via navegação
// client-side interna). Sem isso, o Next as pré-renderiza como estáticas e o
// edge da Vercel pode servi-las indefinidamente após um novo deploy.
const ENTRY_ROUTES = ['/', '/auth/redirect', '/admin', '/comercial', '/servicos', '/financeiro', '/user'];

const nextConfig = {
  reactStrictMode: true, // Ativa o modo estrito do React
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'md-loader'
    });
    return config;
  },
  async headers() {
    return ENTRY_ROUTES.map((source) => ({
      source,
      headers: [{ key: 'Cache-Control', value: 'no-store' }]
    }));
  }
};

export default withMDX({
  extension: /\.mdx?$/
})(nextConfig);
