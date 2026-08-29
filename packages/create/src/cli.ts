#!/usr/bin/env node
import { existsSync } from "node:fs";
import process from "node:process";

import { prompt } from "@optique/clack";
import { object } from "@optique/core/constructs";
import { message } from "@optique/core/message";
import { argument } from "@optique/core/primitives";
import { choice } from "@optique/core/valueparser";
import { printError, run } from "@optique/run";
import { path } from "@optique/run/valueparser";

import { patchExtends, type Preset } from "./index.ts";

export type Toolchain = "oxlint" | "vite-plus";

export interface ParserOptions {
	interactive?: boolean;
	file?: () => Promise<string>;
	toolchain?: () => Promise<string>;
}

const oxlint: Preset = {
	local: "oxlint",
	from: "@kekkon-nexus/config/oxlint",
};

const fileArg = argument(
	path({ metavar: "FILE", mustExist: true, type: "file" }),
);
const toolchainArg = argument(
	choice(["oxlint", "vite-plus"], { metavar: "TOOLCHAIN" }),
);

export function configParser(options: ParserOptions = {}) {
	if (!(options.interactive ?? process.stdin.isTTY === true)) {
		return object({ file: fileArg, toolchain: toolchainArg });
	}
	return object({
		// prompted values bypass the value parsers above
		file: prompt(fileArg, {
			type: "text",
			message: "Config file:",
			validate: (value) => (existsSync(value) ? undefined : "No such file."),
			prompter: options.file,
		}),
		toolchain: prompt(toolchainArg, {
			type: "select",
			message: "Toolchain:",
			options: [
				{ value: "oxlint", label: "oxlint + oxfmt" },
				{ value: "vite-plus", label: "vite-plus" },
			],
			prompter: options.toolchain,
		}),
	});
}

export async function apply(file: string, toolchain: Toolchain): Promise<void> {
	await patchExtends(
		file,
		[oxlint],
		toolchain === "vite-plus" ? "lint" : undefined,
	);
}

if (import.meta.main) {
	const { file, toolchain } = await run(configParser(), { help: "option" });
	try {
		await apply(file, toolchain);
	} catch (error) {
		printError(
			message`${error instanceof Error ? error.message : String(error)}`,
			{ exitCode: 1 },
		);
	}
}
