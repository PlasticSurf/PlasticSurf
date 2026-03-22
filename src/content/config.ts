import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    // SEO & Meta
    title: z.string(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    excerpt: z.string().optional(),
    lead: z.string().optional(),
    
    // Date & Author
    date: z.string(),
    updated: z.string().optional(),
    author: z.string(),
    
    // Media
    featuredImage: z.string(),
    featuredImageAlt: z.string().optional(),
    authorAvatar: z.string().optional(),
    
    // Classification
    category: z.string(),
    tags: z.array(z.string()).default([]),
    
    // Reading Info
    readingTime: z.number().or(z.string()).optional(),
    
    // Author Details
    authorBio: z.string().optional(),
    authorSocial: z.object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      email: z.string().optional(),
    }).optional(),
    
    // Content Options (for frontmatter-based content)
    faq: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).optional(),
    relatedPosts: z.array(z.string()).optional(),
    
    // Series (Blog-Serien)
    series: z.string().optional(),      // Slug der Serie, z. B. "ki-im-handwerk"
    seriesPart: z.number().optional(),  // Teilnummer innerhalb der Serie (1, 2, 3 ...)

    // Visibility
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};