import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseSync } from "oxc-parser";

import { importsDefineConfig } from "./ast.ts";

const OXLINT_FILES = [
	"oxlint.config.ts",
	"oxlint.config.mts",
	"oxlint.config.js",
	"oxlint.config.mjs",
	".oxlintrc.json",
];
const OXFMT_FILES = [
	"oxfmt.config.ts",
	"oxfmt.config.mts",
	"oxfmt.config.js",
	"oxfmt.config.mjs",
	".oxfmtrc.json",
];
const VITE_FILES = [
	"vite.config.ts",
	"vite.config.mts",
	"vite.config.js",
	"vite.config.mjs",
	"vitest.config.ts",
	"vitest.config.mts",
	"vitest.config.js",
	"vitest.config.mjs",
];

export interface Detected {
	oxlint?: string;
	oxfmt?: string;
	vite?: string;
	vitePlus?: string;
}

async function find(
	dir: string,
	names: readonly string[],
): Promise<string | undefined> {
	for (const name of names) {
		const file = path.join(dir, name);
		if (!existsSync(file)) continue;
		const code = await readFile(file, "utf8");
		if (file.endsWith(".json")) {
			JSON.parse(code);
			return file;
		}
		const { errors } = parseSync(file, code);
		if (errors.length > 0) {
			throw new Error(`${file}: ${errors.map((e) => e.message).join("\n")}`);
		}
		return file;
	}
	return undefined;
}

export async function detect(dir: string): Promise<Detected> {
	const vite = await find(dir, VITE_FILES);
	let vitePlus: string | undefined;
	if (vite) {
		const { program } = parseSync(vite, await readFile(vite, "utf8"));
		// bare vite does not count, only a vite-plus defineConfig
		if (importsDefineConfig(program, "vite-plus")) vitePlus = vite;
	}

	return {
		oxlint: await find(dir, OXLINT_FILES),
		oxfmt: await find(dir, OXFMT_FILES),
		vite,
		vitePlus,
	};
}
