// Each project body is its own lazily imported chunk; the page loads the ones it lists.
const bodies = import.meta.glob('/src/content/projects/*.svx', { import: 'default' });

export async function load({ data }) {
	const contents = await Promise.all(
		data.projects.map((project) => bodies[`/src/content/projects/${project.source}`]())
	);
	return { projects: data.projects.map((project, i) => ({ ...project, Body: contents[i] })) };
}
