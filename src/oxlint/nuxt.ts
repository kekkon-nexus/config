import nuxtBase from "@kekkon-nexus/config/oxlint/base/nuxt";
import nuxtStylistic from "@kekkon-nexus/config/oxlint/base/nuxt-stylistic";
import vue from "@kekkon-nexus/config/oxlint/vue";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [vue, nuxtStylistic, nuxtBase],
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
