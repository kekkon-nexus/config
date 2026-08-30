import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parseSync, type Program } from "oxc-parser";

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
];

export interface Detected {
	oxlint?: string;
	oxfmt?: string;
	vite?: string;
	vitePlus?: string;
}

interface Found {
	file: string;
	program?: Program;
}

async function find(
	dir: string,
	names: readonly string[],
): Promise<Found | undefined> {
	for (const name of names) {
		const file = path.join(dir, name);
		if (!existsSync(file)) continue;
		const code = await readFile(file, "utf8");
		if (file.endsWith(".json")) {
			try {
				JSON.parse(code);
			} catch (error) {
				throw new Error(`${file}: ${(error as Error).message}`, {
					cause: error,
				});
			}
			return { file };
		}
		const { program, errors } = parseSync(file, code);
		if (errors.length > 0) {
			throw new Error(`${file}: ${errors.map((e) => e.message).join("\n")}`);
		}
		return { file, program };
	}
	return undefined;
}

export async function detect(dir: string): Promise<Detected> {
	const vite = await find(dir, VITE_FILES);
	const oxlint = await find(dir, OXLINT_FILES);
	const oxfmt = await find(dir, OXFMT_FILES);

	return {
		oxlint: oxlint?.file,
		oxfmt: oxfmt?.file,
		vite: vite?.file,
		// bare vite does not count
		vitePlus:
			vite?.program && importsDefineConfig(vite.program, "vite-plus")
				? vite.file
				: undefined,
	};
}
