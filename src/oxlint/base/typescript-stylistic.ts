import { defineConfig } from "oxlint";

/** typescript-eslint:stylistic-type-checked (warn) */
const config = defineConfig({
	rules: {
		"typescript/adjacent-overload-signatures": "warn",
		"typescript/array-type": "warn",
		"typescript/ban-tslint-comment": "warn",
		"typescript/class-literal-property-style": "warn",
		"typescript/consistent-generic-constructors": "warn",
		"typescript/consistent-indexed-object-style": "warn",
		"typescript/consistent-type-assertions": "warn",
		"typescript/consistent-type-definitions": "warn",
		"typescript/dot-notation": "warn",
		"typescript/no-confusing-non-null-assertion": "warn",
		"typescript/no-inferrable-types": "warn",
		"typescript/non-nullable-type-assertion-style": "warn",
		"typescript/prefer-find": "warn",
		"typescript/prefer-for-of": "warn",
		"typescript/prefer-function-type": "warn",
		"typescript/prefer-includes": "warn",
		"typescript/prefer-nullish-coalescing": "warn",
		"typescript/prefer-optional-chain": "warn",
		"typescript/prefer-regexp-exec": "warn",
		"typescript/prefer-string-starts-ends-with": "warn",
	},
});

export default config;
