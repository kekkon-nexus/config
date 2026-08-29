import { defineConfig } from "oxlint";

const config = defineConfig({
	plugins: ["import"],

	rules: {
		"import/no-duplicates": ["warn", { preferInline: true }],
		"import/no-mutable-exports": "warn",
	},
});

export default config;
