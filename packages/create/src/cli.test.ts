import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { run } from "@optique/run";
import { expect, it, onTestFinished } from "vite-plus/test";

import { apply, configParser, packages } from "./cli.ts";
import { editorconfig } from "./generate.ts";
import { scopePresets } from "./presets.ts";

async function project(files: Record<string, string>): Promise<string> {
	const dir = await mkdtemp(path.join(tmpdir(), "create-config-"));
	onTestFinished(() => rm(dir, { recursive: true }));

	for (const [name, content] of Object.entries(files)) {
		await writeFile(path.join(dir, name), content);
	}
	return dir;
}

const esm = {
	"package.json": '{\n\t"type": "module"\n}\n',
	"tsconfig.json": "{}\n",
};

it("creates both configs when nothing is configured", async () => {
	const dir = await project(esm);
	const written = await apply(
		dir,
		{},
		{
			toolchain: "oxlint",
			scopes: [],
			module: true,
			typescript: false,
			typeAware: false,
			editorconfig: false,
		},
	);

	expect(written).toEqual([
		path.join(dir, "oxlint.config.ts"),
		path.join(dir, "oxfmt.config.ts"),
	]);
	expect(await readFile(path.join(dir, "oxlint.config.ts"), "utf8")).toBe(
		'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
			'import { defineConfig } from "oxlint";\n\n' +
			"export default defineConfig({\n\textends: [oxlint],\n});\n",
	);
	expect(await readFile(path.join(dir, "oxfmt.config.ts"), "utf8")).toBe(
		'import oxfmt from "@kekkon-nexus/config/oxfmt";\n' +
			'import { defineConfig } from "oxfmt";\n\n' +
			"export default defineConfig({\n\t...oxfmt,\n});\n",
	);
});

it("converts json and carries its rules over the presets", async () => {
	const dir = await project({
		...esm,
		".oxlintrc.json":
			'{ "extends": ["./other.json"], "rules": { "eqeqeq": "error" } }',
	});
	await apply(
		dir,
		{ oxlint: path.join(dir, ".oxlintrc.json") },
		{
			toolchain: "oxlint",
			scopes: ["next"],
			module: true,
			typescript: false,
			typeAware: false,
			editorconfig: false,
		},
	);

	expect(await readFile(path.join(dir, "oxlint.config.ts"), "utf8")).toBe(
		'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
			'import next from "@kekkon-nexus/config/oxlint/next";\n' +
			'import { defineConfig } from "oxlint";\n\n' +
			"export default defineConfig({\n" +
			'\textends: [oxlint, next, "./other.json"],\n' +
			'\trules: {\n\t\t"eqeqeq": "error"\n\t},\n' +
			"});\n",
	);
	expect(
		await readFile(path.join(dir, ".oxlintrc.json")).catch(() => "gone"),
	).toBe("gone");
});

it("patches an existing vite-plus config", async () => {
	const source =
		'import { defineConfig } from "vite-plus";\n\n' +
		"export default defineConfig({\n\tlint: { extends: [] },\n});\n";
	const dir = await project({ ...esm, "vite.config.ts": source });
	await apply(
		dir,
		{ vitePlus: path.join(dir, "vite.config.ts") },
		{
			toolchain: "vite-plus",
			scopes: [],
			module: true,
			typescript: false,
			typeAware: false,
			editorconfig: false,
		},
	);

	expect(await readFile(path.join(dir, "vite.config.ts"), "utf8")).toBe(
		'import { defineConfig } from "vite-plus";\n' +
			'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
			'import vp from "@kekkon-nexus/config/oxlint/vite-plus";\n' +
			'import oxfmt from "@kekkon-nexus/config/oxfmt";\n\n' +
			"export default defineConfig({\n" +
			"\tfmt: { ...oxfmt },\n" +
			"\tlint: { extends: [oxlint, vp] },\n" +
			"});\n",
	);
});

it("adds type module when asked, and falls back to mts when not", async () => {
	const dir = await project({
		"package.json": "{}\n",
		"tsconfig.json": "{}\n",
	});
	await apply(
		dir,
		{},
		{
			toolchain: "oxlint",
			scopes: [],
			module: true,
			typescript: false,
			typeAware: false,
			editorconfig: false,
		},
	);
	expect(await readFile(path.join(dir, "package.json"), "utf8")).toBe(
		'{\n\t"type": "module"\n}\n',
	);

	const plain = await project({
		"package.json": "{}\n",
		"tsconfig.json": "{}\n",
	});
	const written = await apply(
		plain,
		{},
		{
			toolchain: "oxlint",
			scopes: [],
			module: false,
			typescript: false,
			typeAware: false,
			editorconfig: false,
		},
	);
	expect(written).toEqual([
		path.join(plain, "oxlint.config.mts"),
		path.join(plain, "oxfmt.config.mts"),
	]);
});

it("refuses to clobber a bare vite config", async () => {
	const source =
		'import { defineConfig } from "vite";\nexport default defineConfig({});\n';
	const dir = await project({ ...esm, "vite.config.ts": source });

	await expect(
		apply(
			dir,
			{ vite: path.join(dir, "vite.config.ts") },
			{
				toolchain: "vite-plus",
				scopes: [],
				module: true,
				typescript: false,
				typeAware: false,
				editorconfig: false,
			},
		),
	).rejects.toThrow("does not import vite-plus");
	expect(await readFile(path.join(dir, "vite.config.ts"), "utf8")).toBe(source);
});

it("refuses to clobber a config detection missed", async () => {
	const dir = await project({
		...esm,
		"oxlint.config.ts": "export default {};\n",
	});

	await expect(
		apply(
			dir,
			{},
			{
				toolchain: "oxlint",
				scopes: [],
				module: true,
				typescript: false,
				typeAware: false,
				editorconfig: false,
			},
		),
	).rejects.toThrow("EEXIST");
});

it("prompts for the toolchain even when one is detected", async () => {
	expect(
		await run(
			configParser(
				{ vite: "vite.config.ts", vitePlus: "vite.config.ts" },
				true,
				{
					toolchain: () => Promise.resolve("vite-plus"),
					scopes: () => Promise.resolve(["react"]),
					install: () => Promise.resolve(true),
					typescript: () => Promise.resolve("true"),
					typeAware: () => Promise.resolve(false),
					editorconfig: () => Promise.resolve(false),
				},
			),
			{ args: [] },
		),
	).toEqual({
		toolchain: "vite-plus",
		scopes: ["react"],
		install: true,
		module: true,
		typescript: true,
		typeAware: false,
		editorconfig: false,
	});
});

it("prefers command line values over prompts", async () => {
	expect(
		await run(
			configParser({}, true, {
				toolchain: () => Promise.reject(new Error("prompted")),
				scopes: () => Promise.reject(new Error("prompted")),
				install: () => Promise.resolve(true),
				typescript: () => Promise.reject(new Error("prompted")),
				typeAware: () => Promise.reject(new Error("prompted")),
				editorconfig: () => Promise.reject(new Error("prompted")),
			}),
			{
				args: [
					"--toolchain",
					"oxlint",
					"--scope",
					"vue",
					"--typescript",
					"strict",
					"--type-aware",
					"--editorconfig",
				],
			},
		),
	).toEqual({
		toolchain: "oxlint",
		scopes: ["vue"],
		install: true,
		module: true,
		typescript: "strict",
		typeAware: true,
		editorconfig: true,
	});
});

it("installs the tools the toolchain needs", () => {
	expect(packages("vite-plus")).toEqual(["@kekkon-nexus/config", "vite-plus"]);
	expect(packages("vite-plus", true)).toEqual([
		"@kekkon-nexus/config",
		"vite-plus",
		"oxlint-tsgolint",
	]);
	expect(packages("oxlint")).toEqual([
		"@kekkon-nexus/config",
		"oxlint",
		"oxfmt",
	]);
});

it("runs off flags alone without a tty", async () => {
	expect(
		await run(configParser({ vitePlus: "vite.config.ts" }, true, {}, false), {
			args: [],
		}),
	).toEqual({
		toolchain: "vite-plus",
		scopes: [],
		install: false,
		module: true,
		typescript: false,
		typeAware: false,
		editorconfig: false,
	});
	expect(
		await run(configParser({}, false, {}, false), {
			args: ["--toolchain", "oxlint", "--scope", "react", "--install"],
		}),
	).toEqual({
		toolchain: "oxlint",
		scopes: ["react"],
		install: true,
		module: false,
		typescript: false,
		typeAware: false,
		editorconfig: false,
	});
});

it("creates a tsconfig, with strict when asked", async () => {
	const dir = await project({ "package.json": '{\n\t"type": "module"\n}\n' });
	const written = await apply(
		dir,
		{},
		{
			toolchain: "oxlint",
			scopes: [],
			module: true,
			typescript: "strict",
			typeAware: true,
			editorconfig: false,
		},
	);

	expect(await readFile(path.join(dir, "tsconfig.json"), "utf8")).toBe(
		'{\n\t"extends": [\n\t\t"@kekkon-nexus/config/ts",\n' +
			'\t\t"@kekkon-nexus/config/ts/strict"\n\t]\n}\n',
	);
	// the fresh tsconfig has to land before the extension is picked
	expect(written).toEqual([
		path.join(dir, "tsconfig.json"),
		path.join(dir, "oxlint.config.ts"),
		path.join(dir, "oxfmt.config.ts"),
	]);
});

it("patches a tsconfig that is already there", async () => {
	const dir = await project({
		...esm,
		"tsconfig.json": '{\n\t"extends": ["./base.json"]\n}\n',
	});
	await apply(
		dir,
		{},
		{
			toolchain: "oxlint",
			scopes: [],
			module: true,
			typescript: true,
			typeAware: false,
			editorconfig: false,
		},
	);

	expect(await readFile(path.join(dir, "tsconfig.json"), "utf8")).toBe(
		'{\n\t"extends": ["./base.json", "@kekkon-nexus/config/ts"]\n}\n',
	);
});

it("writes an editorconfig, but never over one that is there", async () => {
	const dir = await project(esm);
	const written = await apply(
		dir,
		{},
		{
			toolchain: "oxlint",
			scopes: [],
			module: true,
			typescript: false,
			typeAware: false,
			editorconfig: true,
		},
	);

	expect(written[0]).toBe(path.join(dir, ".editorconfig"));
	expect(await readFile(path.join(dir, ".editorconfig"), "utf8")).toBe(
		await editorconfig(),
	);

	const kept = await project({ ...esm, ".editorconfig": "root = false\n" });
	const second = await apply(
		kept,
		{},
		{
			toolchain: "oxlint",
			scopes: [],
			module: true,
			typescript: false,
			typeAware: false,
			editorconfig: true,
		},
	);

	expect(second).not.toContain(path.join(kept, ".editorconfig"));
	expect(await readFile(path.join(kept, ".editorconfig"), "utf8")).toBe(
		"root = false\n",
	);
});

it("turns the type-aware options on in a fresh oxlint config", async () => {
	const dir = await project(esm);
	await apply(
		dir,
		{},
		{
			toolchain: "oxlint",
			scopes: [],
			module: true,
			typescript: false,
			typeAware: true,
			editorconfig: false,
		},
	);

	expect(await readFile(path.join(dir, "oxlint.config.ts"), "utf8")).toBe(
		'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
			'import { defineConfig } from "oxlint";\n\n' +
			"export default defineConfig({\n" +
			"\textends: [oxlint],\n" +
			"\toptions: {\n\t\ttypeAware: true,\n\t\ttypeCheck: true,\n\t},\n" +
			"});\n",
	);
	// oxfmt has no such options
	expect(
		await readFile(path.join(dir, "oxfmt.config.ts"), "utf8"),
	).not.toContain("typeAware");
});

it("turns them on in a fresh vite-plus config", async () => {
	const dir = await project(esm);
	await apply(
		dir,
		{},
		{
			toolchain: "vite-plus",
			scopes: [],
			module: true,
			typescript: false,
			typeAware: true,
			editorconfig: false,
		},
	);

	expect(await readFile(path.join(dir, "vite.config.ts"), "utf8")).toBe(
		'import oxfmt from "@kekkon-nexus/config/oxfmt";\n' +
			'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
			'import vp from "@kekkon-nexus/config/oxlint/vite-plus";\n' +
			'import { defineConfig } from "vite-plus";\n\n' +
			"export default defineConfig({\n" +
			"\tfmt: { ...oxfmt },\n" +
			"\tlint: {\n" +
			"\t\textends: [oxlint, vp],\n" +
			"\t\toptions: {\n\t\t\ttypeAware: true,\n\t\t\ttypeCheck: true,\n\t\t},\n" +
			"\t},\n" +
			"});\n",
	);
});

it("adds them to an existing lint section", async () => {
	const source =
		'import { defineConfig } from "vite-plus";\n\n' +
		"export default defineConfig({\n\tlint: { extends: [] },\n});\n";
	const dir = await project({ ...esm, "vite.config.ts": source });
	await apply(
		dir,
		{ vitePlus: path.join(dir, "vite.config.ts") },
		{
			toolchain: "vite-plus",
			scopes: [],
			module: true,
			typescript: false,
			typeAware: true,
			editorconfig: false,
		},
	);

	expect(await readFile(path.join(dir, "vite.config.ts"), "utf8")).toContain(
		"options: { typeAware: true, typeCheck: true }",
	);
});

it("drops react when next already extends it", () => {
	expect(scopePresets(["next", "react", "jest"])).toEqual([
		{ local: "next", from: "@kekkon-nexus/config/oxlint/next" },
		{ local: "jest", from: "@kekkon-nexus/config/oxlint/jest" },
	]);
});
