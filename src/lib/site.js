export const site = {
	origin: 'https://abhay7.dev',
	name: 'Abhay Bhat',
	// Placeholder until the user writes a real site description.
	description: 'Personal website and blog of Abhay Bhat.',
	repo: 'https://github.com/abhay7dev/www'
};

/** Primary navigation, in display order. */
export const nav = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About' },
	{ href: '/projects', label: 'Projects' },
	{ href: '/experience', label: 'Experience' },
	{ href: '/blog', label: 'Blog' },
	{ href: '/contact', label: 'Contact' }
];

/** Non-blog pages, for the sitemap. Blog URLs are added from content. */
export const pages = ['/', '/about', '/projects', '/experience', '/contact', '/licenses', '/blog'];

export const contact = {
	github: 'https://github.com/abhay7dev',
	linkedin: 'https://linkedin.com/in/abhaygbhat',
	x: 'https://x.com/abhaygb7',
	// Disabled until supplied: set to a mailto: URL / résumé path to show them.
	email: null,
	resume: null
};

// Giscus comments. Comments stay hidden until repoId and categoryId are filled in: enable
// Discussions on the repo, install the giscus app, and copy the IDs from https://giscus.app.
export const giscus = {
	repo: 'abhay7dev/www',
	repoId: '',
	category: '',
	categoryId: ''
};
