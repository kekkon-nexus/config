import { defineConfig } from "oxlint";

import next from "./next.ts";

/** next:core-web-vitals */
const config = defineConfig({
	extends: [next],
	rules: {
		"nextjs/no-html-link-for-pages": "error",
		"nextjs/no-sync-scripts": "error",
	},
});

export default config;
