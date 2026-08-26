import { defineConfig } from "oxlint";

const config = defineConfig({
	env: {
		browser: true,
	},
	plugins: ["jsx-a11y"],
});

export default config;
