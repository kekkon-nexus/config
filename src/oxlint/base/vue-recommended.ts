import { defineConfig } from "oxlint";

import vueStronglyRecommended from "./vue-strongly-recommended.ts";

/** vue:recommended */
const config = defineConfig({
	extends: [vueStronglyRecommended],
	rules: {
		"vue/no-multiple-slot-args": "warn",
		"vue/no-required-prop-with-default": "warn",
	},
});

export default config;
