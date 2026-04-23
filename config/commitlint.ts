import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
	extends: ["@commitlint/config-conventional"],
	formatter: "@commitlint/format",
	defaultIgnores: true,
	helpUrl: "https://conventionalcommits.org",
};

export default config;
