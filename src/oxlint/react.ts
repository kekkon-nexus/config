import { defineConfig } from "oxlint";

const config = defineConfig({
	plugins: ["react", "react-perf"],

	rules: {
		"react-perf/jsx-no-new-array-as-prop": "warn",
		"react-perf/jsx-no-new-function-as-prop": "warn",
		"react-perf/jsx-no-new-object-as-prop": "warn",
		"react/display-name": "warn",
		"react/no-unescaped-entities": "warn",
		"react/only-export-components": "warn",
		"unicorn/filename-case": [
			"warn",
			{ cases: { camelCase: true, kebabCase: true, pascalCase: true } },
		],
	},
});

export default config;
