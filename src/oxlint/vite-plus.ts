import vite from "@kekkon-nexus/config/oxlint/vite";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [vite],
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
