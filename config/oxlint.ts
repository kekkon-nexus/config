import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

const config = defineConfig({
	extends: [core],
	ignorePatterns: [],
	options: {
		reportUnusedDisableDirectives: "warn",
		typeAware: true,
		typeCheck: true,
	},

	rules: {
		"func-style": [
			"warn",
			"declaration",
			{
				allowArrowFunctions: true,
			},
		],
		"sort-keys": [
			"warn",
			"asc",
			{
				allowLineSeparatedGroups: true,
			},
		],
	},
});

export default config;
