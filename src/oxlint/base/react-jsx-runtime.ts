import { defineConfig } from "oxlint";

/** react:jsx-runtime */
const config = defineConfig({
	rules: {
		"react/react-in-jsx-scope": "off",
	},
});

export default config;
