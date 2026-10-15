import { defineConfig } from "oxlint";

/** react-hooks:recommended */
const config = defineConfig({
	rules: {
		"react/capitalized-calls": "off",
		"react/error-boundaries": "error",
		"react/exhaustive-deps": "warn",
		"react/exhaustive-effect-dependencies": "off",
		"react/globals": "error",
		"react/hooks": "off",
		"react/immutability": "error",
		"react/incompatible-library": "warn",
		"react/invariant": "off",
		"react/memo-dependencies": "off",
		"react/no-clone-element": "off", // oxlint-only
		"react/no-deriving-state-in-effects": "off",
		"react/no-react-children": "off", // oxlint-only
		"react/preserve-manual-memoization": "error",
		"react/purity": "error",
		"react/refs": "error",
		"react/rule-suppression": "off",
		"react/rules-of-hooks": "error",
		"react/set-state-in-effect": "error",
		"react/set-state-in-render": "error",
		"react/static-components": "error",
		"react/syntax": "off",
		"react/todo": "off",
		"react/unsupported-syntax": "warn",
		"react/use-memo": "error",
		"react/void-use-memo": "off",
	},
});

export default config;
