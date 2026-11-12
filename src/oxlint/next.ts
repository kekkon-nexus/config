import nextBase from "@kekkon-nexus/config/oxlint/base/next";
import nextCoreWebVitals from "@kekkon-nexus/config/oxlint/base/next-core-web-vitals";
import reactRefreshNext from "@kekkon-nexus/config/oxlint/base/react-refresh-next";
import react from "@kekkon-nexus/config/oxlint/react";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [react, nextBase, nextCoreWebVitals],
	plugins: ["nextjs"],

	rules: {
		"react/only-export-components": [
			"warn",
			reactRefreshNext.rules["react/only-export-components"][1],
		],
	},
});

export default config;
