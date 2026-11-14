import { defineConfig } from "oxlint";

import vueEssential from "./vue.ts";

/** vue:strongly-recommended */
const config = defineConfig({
	extends: [vueEssential],
	rules: {
		"vue/component-definition-name-casing": "warn",
		"vue/prop-name-casing": "warn",
		"vue/require-default-prop": "warn",
		"vue/require-prop-types": "warn",
	},
});

export default config;
