import { defineConfig } from "oxlint";

const config = defineConfig({
	plugins: ["vitest"],

	rules: {
		"vitest/no-commented-out-tests": "warn",
		"vitest/no-unneeded-async-expect-function": "warn",
		"vitest/prefer-called-exactly-once-with": "warn",
	},
});

export default config;
