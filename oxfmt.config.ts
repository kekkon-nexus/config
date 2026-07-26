import base from "@kekkon-nexus/config/oxfmt";
import { defineConfig } from "oxfmt";

const config: ReturnType<typeof defineConfig> = defineConfig({
	...base,

	ignorePatterns: ["aube-lock.yaml"],
});

export default config;
