import { defineConfig } from "oxlint";

/** react-refresh:recommended */
const config = defineConfig({
	rules: {
		"react/only-export-components": ["error", {}],
	},
});

export default config;
