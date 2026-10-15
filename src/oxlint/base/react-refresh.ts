import { defineConfig } from "oxlint";

const config = defineConfig({
	rules: {
		// react-refresh:recommended
		"react/only-export-components": ["error", {}],
	},
});

export default config;
