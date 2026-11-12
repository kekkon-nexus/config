import vue from "@kekkon-nexus/config/oxlint/vue";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [vue],
	jsPlugins: [
		{
			name: "nuxt",
			specifier: "@nuxt/eslint-plugin",
		},
	],
	globals: {
		$fetch: "readonly",
	},
});

export default config;
