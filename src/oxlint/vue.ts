import { defineConfig } from "oxlint";

const config = defineConfig({
	plugins: ["vue"],

	rules: {
		"vue/prefer-import-from-vue": "warn",
		"vue/return-in-computed-property": [
			"error",
			{ treatUndefinedAsUnspecified: false },
		],
	},
});

export default config;
