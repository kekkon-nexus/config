import { defineConfig } from "oxlint";

const config = defineConfig({
	rules: {
		// react-perf:recommended
		"react-perf/jsx-no-jsx-as-prop": "off",
		"react-perf/jsx-no-new-array-as-prop": "error",
		"react-perf/jsx-no-new-function-as-prop": "error",
		"react-perf/jsx-no-new-object-as-prop": "error",
	},
});

export default config;
