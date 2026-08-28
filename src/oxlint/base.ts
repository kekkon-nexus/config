import eslint from "@kekkon-nexus/config/oxlint/base/eslint";
import imp from "@kekkon-nexus/config/oxlint/base/import";
import jest from "@kekkon-nexus/config/oxlint/base/jest";
import jsdoc from "@kekkon-nexus/config/oxlint/base/jsdoc";
import jsxA11y from "@kekkon-nexus/config/oxlint/base/jsx-a11y";
import next from "@kekkon-nexus/config/oxlint/base/next";
import node from "@kekkon-nexus/config/oxlint/base/node";
import promise from "@kekkon-nexus/config/oxlint/base/promise";
import react from "@kekkon-nexus/config/oxlint/base/react";
import reactPerf from "@kekkon-nexus/config/oxlint/base/react-perf";
import typescript from "@kekkon-nexus/config/oxlint/base/typescript";
import unicorn from "@kekkon-nexus/config/oxlint/base/unicorn";
import vitest from "@kekkon-nexus/config/oxlint/base/vitest";
import vue from "@kekkon-nexus/config/oxlint/base/vue";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [
		eslint,
		imp,
		jest,
		jsdoc,
		jsxA11y,
		next,
		node,
		promise,
		react,
		reactPerf,
		typescript,
		unicorn,
		vitest,
		vue,
	],
	plugins: [],
});

export default config;
