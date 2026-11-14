import tailwindBase from "@kekkon-nexus/config/oxlint/base/tailwind";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [tailwindBase],
	jsPlugins: [
		{
			name: "better-tailwindcss",
			specifier: "eslint-plugin-better-tailwindcss",
		},
	],
});

export default config;
