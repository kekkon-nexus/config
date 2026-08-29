import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { run } from "@optique/run";
import { expect, it, onTestFinished } from "vite-plus/test";

import { apply, configParser, packages } from "./cli.ts";
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
		{ toolchain: "oxlint", scopes: ["next"], module: true },
	);

	expect(await readFile(path.join(dir, "oxlint.config.ts"), "utf8")).toBe(
		'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
			'import next from "@kekkon-nexus/config/oxlint/next";\n' +
			'import { defineConfig } from "oxlint";\n\n' +
			"export default defineConfig({\n" +
			'\textends: [oxlint, next, "./other.json"],\n' +
			'\t"rules": {\n\t\t"eqeqeq": "error"\n\t},\n' +
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
		{ toolchain: "vite-plus", scopes: [], module: true },
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
	await apply(dir, {}, { toolchain: "oxlint", scopes: [], module: true });
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
			{ toolchain: "vite-plus", scopes: [], module: true },
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
		apply(dir, {}, { toolchain: "oxlint", scopes: [], module: true }),
	).rejects.toThrow("EEXIST");
});

it("prompts only for what detection cannot answer", async () => {
	expect(
		await run(
			configParser(
				{ vite: "vite.config.ts", vitePlus: "vite.config.ts" },
				true,
				{
					toolchain: () => Promise.reject(new Error("prompted")),
					scopes: () => Promise.resolve(["react"]),
					install: () => Promise.resolve(true),
				},
			),
			{ args: [] },
		),
	).toEqual({
		toolchain: "vite-plus",
		scopes: ["react"],
		install: true,
		module: true,
	});
});

it("prefers command line values over prompts", async () => {
	expect(
		await run(
			configParser({}, true, {
				toolchain: () => Promise.reject(new Error("prompted")),
				scopes: () => Promise.reject(new Error("prompted")),
				install: () => Promise.resolve(true),
			}),
			{ args: ["--toolchain", "oxlint", "--scope", "vue"] },
		),
	).toEqual({
		toolchain: "oxlint",
		scopes: ["vue"],
		install: true,
		module: true,
	});
});

it("installs the tools the toolchain needs", () => {
	expect(packages("vite-plus")).toEqual(["@kekkon-nexus/config", "vite-plus"]);
	expect(packages("oxlint")).toEqual([
		"@kekkon-nexus/config",
		"oxlint",
		"oxfmt",
	]);
});

it("drops presets the toolchain already covers", () => {
	expect(scopePresets(["next", "react", "jest"], "vite-plus")).toEqual([
		{ local: "next", from: "@kekkon-nexus/config/oxlint/next" },
	]);
});
