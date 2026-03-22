/**
 * SEO Utility - Schema.org JSON-LD Generator
 * DSGVO-konform ohne externe Requests
 */

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  sameAs?: string[];
}

export interface WebSiteSchema {
  name: string;
  url: string;
  description?: string;
  language?: string;
}

export interface BlogPostingSchema {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  image?: string;
  url: string;
  publisher?: OrganizationSchema;
}

export interface BreadcrumbListSchema {
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Generates Organization Schema
 */
export function generateOrganizationSchema(data: OrganizationSchema): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    ...(data.logo && { logo: data.logo }),
    ...(data.description && { description: data.description }),
    ...(data.telephone && { telephone: data.telephone }),
    ...(data.email && { email: data.email }),
    ...(data.address && {
      address: {
        '@type': 'PostalAddress',
        ...(data.address.streetAddress && { streetAddress: data.address.streetAddress }),
        ...(data.address.addressLocality && { addressLocality: data.address.addressLocality }),
        ...(data.address.postalCode && { postalCode: data.address.postalCode }),
        ...(data.address.addressCountry && { addressCountry: data.address.addressCountry }),
      },
    }),
    ...(data.sameAs && { sameAs: data.sameAs }),
  };

  return JSON.stringify(schema);
}

/**
 * Generates WebSite Schema
 */
export function generateWebSiteSchema(data: WebSiteSchema): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    ...(data.description && { description: data.description }),
    ...(data.language && { inLanguage: data.language }),
  };

  return JSON.stringify(schema);
}

/**
 * Generates BlogPosting Schema
 */
export function generateBlogPostingSchema(data: BlogPostingSchema): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.headline,
    description: data.description,
    inLanguage: 'de',
    datePublished: data.datePublished,
    ...(data.dateModified && { dateModified: data.dateModified }),
    author: data.author,
    ...(data.image && { image: data.image }),
    url: data.url,
    ...(data.publisher && { publisher: data.publisher }),
  };

  return JSON.stringify(schema);
}

/**
 * Generates BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(schema);
}

/**
 * Generates LocalBusiness Schema (for Impressum page)
 */
export function generateLocalBusinessSchema(data: {
  name: string;
  url: string;
  telephone?: string;
  email?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  openingHours?: string;
}): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name,
    url: data.url,
    ...(data.telephone && { telephone: data.telephone }),
    ...(data.email && { email: data.email }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry,
    },
    ...(data.openingHours && { openingHours: data.openingHours }),
  };

  return JSON.stringify(schema);
}