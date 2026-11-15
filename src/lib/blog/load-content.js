// Universal load shared by blog routes. Each article is its own lazily imported chunk, so a page
// only downloads the article (and demo code) it displays.
const modules = import.meta.glob('/src/content/blog/**/*.svx');

export async function loadContent({ data }) {
	const { default: content } = await modules[`/src/content/blog/${data.source}`]();
	return { ...data, content };
}
