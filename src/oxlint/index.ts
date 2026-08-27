import base from "@kekkon-nexus/config/oxlint/base";
import browser from "@kekkon-nexus/config/oxlint/browser";
import correctness from "@kekkon-nexus/config/oxlint/correctness";
import imp from "@kekkon-nexus/config/oxlint/import";
import javascript from "@kekkon-nexus/config/oxlint/javascript";
import jsdoc from "@kekkon-nexus/config/oxlint/jsdoc";
import node from "@kekkon-nexus/config/oxlint/node";
import typescript from "@kekkon-nexus/config/oxlint/typescript";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [
		base,
		correctness,
		javascript,
		typescript,
		imp,
		jsdoc,
		browser,
		node,
	],
});

export default config;
