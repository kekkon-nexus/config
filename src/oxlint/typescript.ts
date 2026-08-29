import { defineConfig } from "oxlint";

const config = defineConfig({
	plugins: ["typescript"],

	rules: {
		"typescript/consistent-type-assertions": [
			"warn",
			{
				assertionStyle: "as",
				objectLiteralTypeAssertions: "allow-as-parameter",
			},
		],
		"typescript/consistent-type-imports": [
			"warn",
			{ fixStyle: "inline-type-imports" },
		],
		"typescript/no-deprecated": "warn",
		"typescript/no-duplicate-type-constituents": "warn",
		"typescript/no-dynamic-delete": "warn",
		"typescript/no-extraneous-class": "warn",
		"typescript/no-meaningless-void-operator": "warn",
		"typescript/no-namespace": "warn",
		"typescript/no-redundant-type-constituents": "warn",
		"typescript/no-require-imports": "warn",
		"typescript/no-this-alias": "warn",
		"typescript/no-unnecessary-boolean-literal-compare": "warn",
		"typescript/no-unnecessary-template-expression": "warn",
		"typescript/no-unnecessary-type-arguments": "warn",
		"typescript/no-unnecessary-type-constraint": "warn",
		"typescript/no-unnecessary-type-conversion": "warn",
		"typescript/no-unnecessary-type-parameters": "warn",
		"typescript/no-useless-default-assignment": "warn",
		"typescript/prefer-as-const": "warn",
		"typescript/prefer-literal-enum-member": [
			"warn",
			{ allowBitwiseExpressions: true },
		],
		"typescript/prefer-namespace-keyword": "warn",
		"typescript/prefer-reduce-type-parameter": "warn",
		"typescript/prefer-return-this-type": "warn",
		"typescript/require-await": "warn",
		"typescript/triple-slash-reference": "warn",
		"typescript/unified-signatures": "warn",
	},
});

export default config;
