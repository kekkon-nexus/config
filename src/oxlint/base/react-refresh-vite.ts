import { defineConfig } from "oxlint";

import reactRefresh from "./react-refresh.ts";

/** react-refresh:vite */
const config = defineConfig({
	extends: [reactRefresh],
	rules: {
		"react/only-export-components": [
			"error",
			{ allowConstantExport: true, allowCompoundComponents: true },
		],
	},
});

export default config;
