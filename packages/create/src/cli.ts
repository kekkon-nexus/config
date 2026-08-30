#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { prompt } from "@optique/clack";
import { object } from "@optique/core/constructs";
import { message } from "@optique/core/message";
import { map, multiple, withDefault } from "@optique/core/modifiers";
import { option } from "@optique/core/primitives";
import { choice } from "@optique/core/valueparser";
import { print, printError, run } from "@optique/run";

import { detect, type Detected } from "./detect.ts";
import { convert, create, renderVitePlus } from "./generate.ts";
import { patchExtends, patchSpread, patchTsconfig } from "./index.ts";
import {
	OXFMT,
	OXLINT,
	type Scope,
	scopePresets,
	SCOPES,
	type Toolchain,
	TS,
	TS_STRICT,
	type TypeScript,
	typescriptValue,
	VITE_PLUS,
} from "./presets.ts";
import {
	type Chosen,
	scopePrompter,
	toolchainPrompter,
	toolchainSelect,
	TYPESCRIPT_SELECT,
} from "./prompt.ts";

export type { Toolchain } from "./presets.ts";

export interface Answers {
	toolchain: Toolchain;
	scopes: readonly Scope[];
	module: boolean;
	typescript: TypeScript;
	typeAware: boolean;
}

export function packages(toolchain: Toolchain, typeAware = false): string[] {
	return [
		"@kekkon-nexus/config",
		...(toolchain === "vite-plus" ? ["vite-plus"] : ["oxlint", "oxfmt"]),
		...(typeAware ? ["oxlint-tsgolint"] : []),
	];
}

export interface Prompters {
	toolchain?: () => Promise<string>;
	scopes?: () => Promise<readonly string[]>;
	module?: () => Promise<boolean>;
	install?: () => Promise<boolean>;
	typescript?: () => Promise<string>;
	typeAware?: () => Promise<boolean>;
}

async function packageJson(dir: string): Promise<Record<string, unknown>> {
	const file = path.join(dir, "package.json");
	if (!existsSync(file)) return {};
	return JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>;
}

async function esmPackage(dir: string): Promise<boolean> {
	const pkg = await packageJson(dir);
	return pkg["type"] === "module";
}

function extension(dir: string, esm: boolean): string {
	const ts = existsSync(path.join(dir, "tsconfig.json"));
	if (esm) return ts ? ".ts" : ".js";
	return ts ? ".mts" : ".mjs";
}

export function configParser(
	found: Detected,
	esm: boolean,
	prompters: Prompters = {},
	tty = true,
) {
	const initial: Toolchain = found.vitePlus ? "vite-plus" : "oxlint";
	const chosen: Chosen = { toolchain: initial };

	const toolchainArg = option("--toolchain", choice(["oxlint", "vite-plus"]));
	const scopesArg = multiple(
		option("--scope", choice(["jest", "next", "react", "vitest", "vue"])),
	);
	const moduleArg = option("--module");
	const installArg = option("--install");
	const typescriptArg = option(
		"--typescript",
		choice(["false", "true", "strict"]),
	);
	const typeAwareArg = option("--type-aware");

	// no tty, so unanswered flags fall back instead of prompting
	if (!tty) {
		return object({
			toolchain: withDefault(toolchainArg, initial),
			scopes: withDefault(scopesArg, [] as Scope[]),
			typeAware: withDefault(typeAwareArg, false),
			typescript: map(withDefault(typescriptArg, "false"), typescriptValue),
			install: withDefault(installArg, false),
			module: withDefault(moduleArg, esm),
		});
	}

	return object({
		toolchain: prompt(toolchainArg, {
			type: "select",
			...toolchainSelect(found),
			prompter: prompters.toolchain ?? toolchainPrompter(found, chosen),
		}),
		scopes: prompt(scopesArg, {
			type: "multiselect",
			message: "Project scope:",
			required: false,
			options: ["jest", "next", "react", "vitest", "vue"],
			prompter: prompters.scopes ?? scopePrompter(chosen),
		}),
		typeAware: prompt(typeAwareArg, {
			type: "confirm",
			message: "Type-aware linting?",
			initialValue: true,
			prompter: prompters.typeAware,
		}),
		typescript: map(
			prompt(typescriptArg, {
				type: "select",
				...TYPESCRIPT_SELECT,
				prompter: prompters.typescript,
			}),
			typescriptValue,
		),
		install: prompt(installArg, {
			type: "confirm",
			message: "Install the config packages?",
			initialValue: true,
			prompter: prompters.install,
		}),
		module: esm
			? withDefault(moduleArg, true)
			: prompt(moduleArg, {
					type: "confirm",
					message: 'Add "type": "module" to package.json?',
					initialValue: true,
					prompter: prompters.module,
				}),
	});
}

export async function apply(
	dir: string,
	found: Detected,
	answers: Answers,
): Promise<string[]> {
	if (answers.module && !(await esmPackage(dir))) {
		const file = path.join(dir, "package.json");
		if (existsSync(file)) {
			const pkg = await packageJson(dir);
			pkg["type"] = "module";
			await writeFile(file, `${JSON.stringify(pkg, undefined, "\t")}\n`);
		}
	}

	const written: string[] = [];

	// before extension(), which picks .ts off a tsconfig.json
	if (answers.typescript !== false) {
		const tsconfig = path.join(dir, "tsconfig.json");
		const tsPresets = answers.typescript === "strict" ? [TS, TS_STRICT] : [TS];
		if (existsSync(tsconfig)) await patchTsconfig(tsconfig, tsPresets);
		else {
			await writeFile(
				tsconfig,
				`${JSON.stringify({ extends: tsPresets }, undefined, "\t")}\n`,
			);
		}
		written.push(tsconfig);
	}

	const ext = extension(dir, await esmPackage(dir));
	const scoped = scopePresets(answers.scopes);
	// the vite-plus preset already extends vitest
	const presets = [
		OXLINT,
		...(answers.toolchain === "vite-plus"
			? scoped.filter((preset) => preset !== SCOPES.vitest)
			: scoped),
	];

	if (answers.toolchain === "vite-plus") {
		if (found.vitePlus) {
			await patchExtends(found.vitePlus, [...presets, VITE_PLUS], "lint");
			await patchSpread(found.vitePlus, OXFMT, "fmt");
			written.push(found.vitePlus);
			return written;
		}
		if (found.vite) {
			throw new Error(`${found.vite} does not import vite-plus`);
		}
		const file = path.join(dir, `vite.config${ext}`);
		await writeFile(file, renderVitePlus([...presets, VITE_PLUS], OXFMT), {
			flag: "wx",
		});
		written.push(file);
		return written;
	}

	for (const tool of ["oxlint", "oxfmt"] as const) {
		const current = tool === "oxlint" ? found.oxlint : found.oxfmt;
		const toolPresets = tool === "oxlint" ? presets : [OXFMT];
		const target = path.join(dir, `${tool}.config${ext}`);

		if (current?.endsWith(".json")) {
			await convert(current, target, tool, toolPresets);
			written.push(target);
		} else if (current) {
			await (tool === "oxlint"
				? patchExtends(current, toolPresets)
				: patchSpread(current, OXFMT));
			written.push(current);
		} else {
			await create(target, tool, toolPresets);
			written.push(target);
		}
	}
	return written;
}

if (import.meta.main) {
	const dir = process.cwd();

	try {
		const found = await detect(dir);
		const answers = await run(
			configParser(
				found,
				await esmPackage(dir),
				{},
				Boolean(process.stdin.isTTY),
			),
			{ help: "option" },
		);
		const written = await apply(dir, found, answers);
		print(message`Wrote ${written.join(", ")}.`);

		if (answers.install) {
			const add = [
				"add",
				"-D",
				...packages(answers.toolchain, answers.typeAware),
			];
			print(message`Running ${`vp ${add.join(" ")}`}.`);
			await new Promise<void>((resolve, reject) => {
				spawn("vp", add, { cwd: dir, stdio: "inherit" })
					.on("error", reject)
					.on("close", (status) =>
						status === 0
							? resolve()
							: reject(new Error(`vp add exited with ${status}`)),
					);
			});
		}
	} catch (error) {
		printError(
			message`${error instanceof Error ? error.message : String(error)}`,
			{ exitCode: 1 },
		);
	}
}
