import tailwindBase from "@kekkon-nexus/config/oxlint/base/tailwind";
import { defineConfig } from "oxlint";

try {
	import.meta.resolve("eslint-plugin-better-tailwindcss");
} catch (error) {
	throw new Error(
		"@kekkon-nexus/config/oxlint/tailwind needs eslint-plugin-better-tailwindcss, install it as a devDependency",
		{ cause: error },
	);
}

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
