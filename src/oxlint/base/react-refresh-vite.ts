import { defineConfig } from "oxlint";

/** react-refresh:vite */
const config = defineConfig({
	rules: {
		"react/only-export-components": [
			"error",
			{ allowConstantExport: true, allowCompoundComponents: true },
		],
	},
});

export default config;
