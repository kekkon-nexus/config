import vitestBase from "@kekkon-nexus/config/oxlint/base/vitest";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [vitestBase],
	plugins: ["vitest"],

	rules: {
		"vitest/consistent-test-it": ["warn", { fn: "it", withinDescribe: "it" }],
		"vitest/no-commented-out-tests": "warn",
		"vitest/no-unneeded-async-expect-function": "warn",
		"vitest/prefer-called-exactly-once-with": "warn",
	},
});

export default config;
