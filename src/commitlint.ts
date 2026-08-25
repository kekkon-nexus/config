import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
	extends: ["@commitlint/config-conventional"],

	defaultIgnores: true,
	formatter: "@commitlint/format",
	helpUrl: "https://conventionalcommits.org",
};

export default config;
