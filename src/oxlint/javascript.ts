import { defineConfig } from "oxlint";

const config = defineConfig({
	env: {
		"builtin": true,
		"shared-node-browser": true,
	},
	plugins: ["eslint", "oxc", "promise"],

	rules: {
		"array-callback-return": "error",
		"block-scoped-var": "error",
		"eqeqeq": ["error", "smart"],
		"no-alert": "warn",
		"no-console": ["warn", { allow: ["warn", "error", "info", "clear"] }],
		"no-debugger": "warn",
		"no-empty": ["error", { allowEmptyCatch: true }],
		"no-fallthrough": [
			"error",
			{
				commentPattern: String.raw`break[\s\w]*omitted`,
				reportUnusedFallthroughComment: true,
			},
		],
		"no-inner-declarations": [
			"error",
			"functions",
			{
				blockScopedFunctions: "allow",
				namespaces: "allow",
			},
		],
		"no-lonely-if": "warn",
		"no-multi-str": "warn",
		"no-unused-expressions": [
			"error",
			{
				allowShortCircuit: true,
				allowTaggedTemplates: true,
				allowTernary: true,
				enforceForJSX: true,
				ignoreDirectives: true,
			},
		],
		"no-unused-vars": [
			"warn",
			{
				args: "after-used",
				caughtErrors: "all",
				vars: "local",

				argsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
				varsIgnorePattern: "^_",

				reportUsedIgnorePattern: true,

				ignoreClassWithStaticInitBlock: true,
				ignoreRestSiblings: false,
				ignoreUsingDeclarations: false,

				fix: {
					imports: "fix",
					variables: "suggestion",
				},
			},
		],
		"no-use-before-define": [
			"error",
			{
				classes: false,
				enums: false,
				functions: false,
				typedefs: false,
				variables: true,

				allowNamedExports: false,
				ignoreTypeReferences: true,
			},
		],
		"no-useless-call": "warn",
		"no-useless-computed-key": "warn",
		"no-useless-constructor": "warn",
		"no-useless-rename": "warn",
		"no-var": "warn",
		"no-void": "warn",
		"object-shorthand": [
			"warn",
			"always",
			{
				avoidQuotes: true,
				ignoreConstructors: false,
			},
		],
		"one-var": ["warn", { initialized: "never" }],
		"prefer-arrow-callback": [
			"warn",
			{
				allowNamedFunctions: true,
				allowUnboundThis: true,
			},
		],
		"prefer-const": [
			"warn",
			{
				destructuring: "all",
				ignoreReadBeforeAssign: true,
			},
		],
		"prefer-exponentiation-operator": "warn",
		"prefer-regex-literals": ["warn", { disallowRedundantWrapping: true }],
		"prefer-rest-params": "warn",
		"prefer-spread": "warn",
		"prefer-template": "warn",
		"unicode-bom": "error",
		"use-isnan": [
			"error",
			{ enforceForIndexOf: true, enforceForSwitchCase: true },
		],
		"valid-typeof": ["error", { requireStringLiterals: true }],
		"vars-on-top": "warn",
	},
});

export default config;
