import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined, // or '404.html' for SPA-ish routing
			precompress: false
		}),
		paths: {
			base: process.env.BASE_PATH || ''
		}
	}
};
