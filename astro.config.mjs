// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.plasticsurf.de',
  security: {
    checkOrigin: false,
  },
  output: 'static',
  adapter: vercel({
    functionPerRoute: false,
    edgeMiddleware: false,
  }),
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});
