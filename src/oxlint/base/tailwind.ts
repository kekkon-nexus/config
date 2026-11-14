import { defineConfig } from "oxlint";

/** better-tailwindcss:recommended */
const config = defineConfig({
	rules: {
		"better-tailwindcss/enforce-canonical-classes": "warn",
		"better-tailwindcss/enforce-consistent-class-order": "warn",
		"better-tailwindcss/enforce-consistent-line-wrapping": "warn",
		"better-tailwindcss/no-concatenated-classes": "error",
		"better-tailwindcss/no-conflicting-classes": "error",
		"better-tailwindcss/no-deprecated-classes": "warn",
		"better-tailwindcss/no-duplicate-classes": "warn",
		"better-tailwindcss/no-unknown-classes": "error",
		"better-tailwindcss/no-unnecessary-whitespace": "warn",
	},
});

export default config;
