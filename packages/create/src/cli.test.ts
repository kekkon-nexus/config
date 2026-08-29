import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { run } from "@optique/run";
import { expect, it, onTestFinished } from "vite-plus/test";

import { apply, configParser } from "./cli.ts";

async function config(source = "export default {};\n"): Promise<string> {
	const dir = await mkdtemp(path.join(tmpdir(), "create-config-"));
	onTestFinished(() => rm(dir, { recursive: true }));

	const file = path.join(dir, "config.ts");
	await writeFile(file, source);
	return file;
}

it("reads both values from the command line", async () => {
	const file = await config();
	expect(
		await run(configParser({ interactive: false }), {
			args: [file, "vite-plus"],
		}),
	).toEqual({ file, toolchain: "vite-plus" });
});

it("prompts for missing values", async () => {
	const file = await config();
	expect(
		await run(
			configParser({
				interactive: true,
				file: () => Promise.resolve(file),
				toolchain: () => Promise.resolve("oxlint"),
			}),
			{ args: [] },
		),
	).toEqual({ file, toolchain: "oxlint" });
});

it("prefers command line values over prompts", async () => {
	const file = await config();
	expect(
		await run(
			configParser({
				interactive: true,
				file: () => Promise.reject(new Error("prompted")),
				toolchain: () => Promise.reject(new Error("prompted")),
			}),
			{ args: [file, "oxlint"] },
		),
	).toEqual({ file, toolchain: "oxlint" });
});

it("patches the lint section for vite-plus", async () => {
	const file = await config();
	await apply(file, "vite-plus");
	expect(await readFile(file, "utf8")).toBe(
		'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
			"export default {lint:{extends:[oxlint]},};\n",
	);
});

it("patches the root for oxlint", async () => {
	const file = await config();
	await apply(file, "oxlint");
	expect(await readFile(file, "utf8")).toBe(
		'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
			"export default {extends:[oxlint],};\n",
	);
});
