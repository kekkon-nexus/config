import { defineConfig } from "oxlint";

/** nuxt */
const config = defineConfig({
	rules: {
		"nuxt/no-nuxt-config-test-key": "error",
		"nuxt/no-page-meta-runtime-values": "error",
		"nuxt/prefer-import-meta": "error",
	},
});

export default config;
