import { defineConfig } from "oxlint";

import jsdoc from "./jsdoc.ts";

/** jsdoc:recommended-typescript (warn) */
const config = defineConfig({
	extends: [jsdoc],
	rules: {
		"jsdoc/check-tag-names": ["warn", { typed: true }],
		"jsdoc/require-param-type": "off",
		"jsdoc/require-property-type": "off",
		"jsdoc/require-returns-type": "off",
	},
});

export default config;
