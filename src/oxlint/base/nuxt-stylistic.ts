import { defineConfig } from "oxlint";

/** nuxt:stylistic (warn) */
const config = defineConfig({
	rules: {
		"nuxt/no-nuxt-config-test-key": "warn",
		"nuxt/no-page-meta-runtime-values": "warn",
		"nuxt/nuxt-config-keys-order": "warn",
		"nuxt/prefer-import-meta": "warn",
	},
});

export default config;
