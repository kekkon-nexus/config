import { defineConfig } from "oxlint";

const config = defineConfig({
	env: {
		node: true,
	},
	plugins: ["node"],
});

export default config;
