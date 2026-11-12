import jsxA11yBase from "@kekkon-nexus/config/oxlint/base/jsx-a11y";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [jsxA11yBase],
	env: {
		browser: true,
	},
	plugins: ["jsx-a11y"],
});

export default config;
