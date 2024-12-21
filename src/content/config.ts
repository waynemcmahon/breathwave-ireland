import { z, defineCollection } from "astro:content";

// Every collection must reflect Decap's config.yml collection schema
// In order to be able to optimize images with Astro built-in compoments, like <Image />, we first must use this image helper 
// Doc: https://docs.astro.build/en/guides/images/#images-in-content-collections

const eventsCollection = defineCollection({
	type: "content",
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			author: z.string(),
			date: z.date(),
			price: z.number().optional(),
			paymentLink: z.string().optional(),
			image: image(),
			imageAlt: z.string(),
			tags: z.array(z.string()),
			location: z.string().optional(),
		}),
});

const podcastCollection = defineCollection({
	type: 'content',
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		guest: z.string(),
		role: z.string(),
			date: z.date(),
			image: image(),
			imageAlt: z.string(),
			url: z.string(),
		}),
});

export const collections = {
	events: eventsCollection,
	podcasts: podcastCollection,
};