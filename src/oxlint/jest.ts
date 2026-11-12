import jestBase from "@kekkon-nexus/config/oxlint/base/jest";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [jestBase],
	plugins: ["jest"],

	rules: {
		"jest/expect-expect": "error",
		"jest/consistent-test-it": ["warn", { fn: "it", withinDescribe: "it" }],
		"jest/no-alias-methods": "warn",
		"jest/no-deprecated-functions": "warn",
	},
});

export default config;
