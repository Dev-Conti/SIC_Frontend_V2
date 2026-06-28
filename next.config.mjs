import withMDX from '@next/mdx';

const nextConfig = {
  reactStrictMode: true, // Ativa o modo estrito do React
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'md-loader'
    });
    return config;
  }
};

export default withMDX({
  extension: /\.mdx?$/
})(nextConfig);
