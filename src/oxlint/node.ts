import nodeBase from "@kekkon-nexus/config/oxlint/base/node";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [nodeBase],
	env: {
		node: true,
	},
	plugins: ["node"],
});

export default config;
