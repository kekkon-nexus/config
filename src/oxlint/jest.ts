import { defineConfig } from "oxlint";

const config = defineConfig({
	plugins: ["jest"],

	rules: {
		"jest/consistent-test-it": ["warn", { fn: "it", withinDescribe: "it" }],
		"jest/no-alias-methods": "warn",
		"jest/no-deprecated-functions": "warn",
	},
});

export default config;
