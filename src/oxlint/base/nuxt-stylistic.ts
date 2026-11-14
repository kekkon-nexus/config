import { defineConfig } from "oxlint";

import nuxt from "./nuxt.ts";

/** nuxt:stylistic (warn) */
const config = defineConfig({
	extends: [nuxt],
	rules: {
		"nuxt/nuxt-config-keys-order": "warn",
	},
});

export default config;
