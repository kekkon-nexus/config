import eslint from "@kekkon-nexus/config/oxlint/base/eslint";
import imp from "@kekkon-nexus/config/oxlint/base/import";
import jest from "@kekkon-nexus/config/oxlint/base/jest";
import jsdoc from "@kekkon-nexus/config/oxlint/base/jsdoc";
import jsxA11y from "@kekkon-nexus/config/oxlint/base/jsx-a11y";
import next from "@kekkon-nexus/config/oxlint/base/next";
import nextCoreWebVitals from "@kekkon-nexus/config/oxlint/base/next-core-web-vitals";
import node from "@kekkon-nexus/config/oxlint/base/node";
import promise from "@kekkon-nexus/config/oxlint/base/promise";
import react from "@kekkon-nexus/config/oxlint/base/react";
import reactHooks from "@kekkon-nexus/config/oxlint/base/react-hooks";
import reactJsxRuntime from "@kekkon-nexus/config/oxlint/base/react-jsx-runtime";
import reactPerf from "@kekkon-nexus/config/oxlint/base/react-perf";
import reactRefresh from "@kekkon-nexus/config/oxlint/base/react-refresh";
import typescript from "@kekkon-nexus/config/oxlint/base/typescript";
import typescriptStylistic from "@kekkon-nexus/config/oxlint/base/typescript-stylistic";
import unicorn from "@kekkon-nexus/config/oxlint/base/unicorn";
import vitest from "@kekkon-nexus/config/oxlint/base/vitest";
import vue from "@kekkon-nexus/config/oxlint/base/vue";
import vueRecommended from "@kekkon-nexus/config/oxlint/base/vue-recommended";
import vueStronglyRecommended from "@kekkon-nexus/config/oxlint/base/vue-strongly-recommended";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [
		eslint,
		imp,
		jest,
		jsdoc,
		jsxA11y,
		next,
		nextCoreWebVitals,
		node,
		promise,
		react,
		reactJsxRuntime,
		reactHooks,
		reactRefresh,
		reactPerf,
		typescript,
		typescriptStylistic,
		unicorn,
		vitest,
		// vue flat configs are cumulative, error is applied last
		vueRecommended,
		vueStronglyRecommended,
		vue,
	],
	plugins: [],
});

export default config;
