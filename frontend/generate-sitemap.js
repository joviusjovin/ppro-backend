import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

// Define your routes - update these to match your actual app routes
const routes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.8 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/projects', changefreq: 'monthly', priority: 0.7 },
  { url: '/services', changefreq: 'monthly', priority: 0.7 },
];

async function generateSitemap() {
  const sitemap = new SitemapStream({
    hostname: 'https://pprotz.org',
    lastmodDateOnly: true
  });

  routes.forEach(route => sitemap.write(route));
  sitemap.end();

  const sitemapPath = resolve('./dist/sitemap.xml');
  const writeStream = createWriteStream(sitemapPath);
  sitemap.pipe(writeStream);

  await streamToPromise(sitemap);
  console.log('✅ Sitemap generated at:', sitemapPath);
}

generateSitemap().catch(console.error);