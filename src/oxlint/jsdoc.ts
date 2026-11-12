import jsdocBase from "@kekkon-nexus/config/oxlint/base/jsdoc";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [jsdocBase],
	plugins: ["jsdoc"],
});

export default config;
