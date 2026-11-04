import reactRefreshNext from "@kekkon-nexus/config/oxlint/base/react-refresh-next";
import react from "@kekkon-nexus/config/oxlint/react";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [react],
	plugins: ["nextjs"],

	rules: {
		"react/only-export-components": [
			"warn",
			reactRefreshNext.rules["react/only-export-components"][1],
		],
	},
});

export default config;
