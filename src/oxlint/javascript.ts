import { defineConfig } from "oxlint";

const config = defineConfig({
	env: {
		"builtin": true,
		"shared-node-browser": true,
	},
	plugins: ["eslint", "oxc", "promise"],
});

export default config;
