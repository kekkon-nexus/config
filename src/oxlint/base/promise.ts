import { defineConfig } from "oxlint";

/** promise:recommended */
const config = defineConfig({
	rules: {
		"promise/always-return": "error",
		"promise/avoid-new": "off",
		"promise/catch-or-return": "error",
		"promise/no-callback-in-promise": "warn",
		"promise/no-multiple-resolved": "off",
		"promise/no-nesting": "warn",
		"promise/no-new-statics": "error",
		"promise/no-promise-in-callback": "warn",
		"promise/no-return-in-finally": "warn",
		"promise/no-return-wrap": "error",
		"promise/param-names": "error",
		"promise/prefer-await-to-callbacks": "off",
		"promise/prefer-await-to-then": "off",
		"promise/prefer-catch": "off",
		"promise/spec-only": "off",
		"promise/valid-params": "warn",
	},
});

export default config;
