import vitest from "@kekkon-nexus/config/oxlint/vitest";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [vitest],
	jsPlugins: [
		{
			name: "vite-plus",
			specifier: "vite-plus/oxlint-plugin",
		},
	],

	rules: {
		"vite-plus/prefer-vite-plus-imports": "error",
	},
});

export default config;
