// Route transitions: the current page's visible blocks fade out top to bottom, then the new
// page's blocks rise in. The first page load gets the same entrance from CSS (app.css), which
// works without JavaScript; the `navigated` class on <html> switches that off afterwards.
import { onMount } from 'svelte';
import { beforeNavigate, onNavigate } from '$app/navigation';

// Lists of cards (blog listing, projects) stagger card by card.
const BLOCKS =
	':scope > *, :scope > article > *, .article-body > *, :scope > :is(.post-list, .project-grid) > li';
const EASE_OUT = 'cubic-bezier(0.2, 0, 0, 1)';
const SKELETON_AFTER = 200; // ms; prerendered + preloaded pages rarely take this long

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const blocksOf = (main) =>
	[...main.querySelectorAll(BLOCKS)].filter(
		(el) =>
			!el.matches('article, .article-body, .post-list, .project-grid') && el.getClientRects().length
	);

const inView = (el) => {
	const { top, bottom } = el.getBoundingClientRect();
	return bottom > 0 && top < innerHeight;
};

function enter(main) {
	blocksOf(main).forEach((el, i) =>
		el.animate(
			[
				{ opacity: 0, transform: 'translateY(0.5rem)' },
				{ opacity: 1, transform: 'none' }
			],
			{ duration: 260, delay: Math.min(i, 8) * 40, easing: EASE_OUT, fill: 'backwards' }
		)
	);
}

/** Call once from the root layout with a getter for the <main> element. */
export function routeTransitions(getMain) {
	let skeleton;

	// Leaving the site (willUnload) must not start the skeleton: the browser would keep it in
	// the back/forward cache and show it on return.
	beforeNavigate(({ to, from, willUnload }) => {
		if (willUnload || to?.url.pathname === from?.url.pathname) return;
		skeleton = setTimeout(() => getMain()?.classList.add('loading'), SKELETON_AFTER);
	});
	// A page restored from the back/forward cache never shows a stale skeleton.
	onMount(() => {
		const onPageShow = () => {
			clearTimeout(skeleton);
			getMain()?.classList.remove('loading');
		};
		addEventListener('pageshow', onPageShow);
		return () => removeEventListener('pageshow', onPageShow);
	});

	onNavigate((navigation) => {
		clearTimeout(skeleton);
		const main = getMain();
		const samePage = navigation.from?.url.pathname === navigation.to?.url.pathname;
		if (!main || samePage) return;
		document.documentElement.classList.add('navigated');
		const wasLoading = main.classList.contains('loading');
		main.classList.remove('loading');
		if (reducedMotion()) return;

		const leaving = wasLoading ? [] : blocksOf(main).filter(inView).slice(0, 8);
		const animations = leaving.map((el, i) =>
			el.animate(
				[
					{ opacity: 1, transform: 'none' },
					{ opacity: 0, transform: 'translateY(0.375rem)' }
				],
				{ duration: 100, delay: Math.min(i, 3) * 30, easing: 'ease-in', fill: 'forwards' }
			)
		);
		return Promise.all(animations.map((a) => a.finished)).then(() => {
			main.style.opacity = '0'; // hides the swap until the new blocks are animating
			const reset = () => {
				animations.forEach((a) => a.cancel()); // elements that persist must not stay faded
				main.style.opacity = '';
			};
			navigation.complete.then(() => {
				reset();
				enter(main);
			}, reset);
		});
	});
}
