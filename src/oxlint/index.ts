import base from "@kekkon-nexus/config/oxlint/base";
import browser from "@kekkon-nexus/config/oxlint/browser";
import javascript from "@kekkon-nexus/config/oxlint/javascript";
import jsdoc from "@kekkon-nexus/config/oxlint/jsdoc";
import node from "@kekkon-nexus/config/oxlint/node";
import sort from "@kekkon-nexus/config/oxlint/sort";
import typescript from "@kekkon-nexus/config/oxlint/typescript";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [base, javascript, typescript, sort, jsdoc, browser, node],
});

export default config;
