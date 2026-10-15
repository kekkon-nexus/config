import { defineConfig } from "oxlint";

const config = defineConfig({
	rules: {
		// react:jsx-runtime
		"react/react-in-jsx-scope": "off",
	},
});

export default config;
