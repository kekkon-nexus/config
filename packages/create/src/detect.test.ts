import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { expect, it, onTestFinished } from "vite-plus/test";

import { detect } from "./detect.ts";

async function project(files: Record<string, string>): Promise<string> {
	const dir = await mkdtemp(path.join(tmpdir(), "create-config-"));
	onTestFinished(() => rm(dir, { recursive: true }));

	for (const [name, content] of Object.entries(files)) {
		await writeFile(path.join(dir, name), content);
	}
	return dir;
}

it("finds oxlint and oxfmt configs", async () => {
	const dir = await project({
		".oxlintrc.json": "{}",
		"oxfmt.config.ts": "export default {};\n",
	});
	expect(await detect(dir)).toEqual({
		oxlint: path.join(dir, ".oxlintrc.json"),
		oxfmt: path.join(dir, "oxfmt.config.ts"),
		vite: undefined,
		vitePlus: undefined,
	});
});

it("ignores a vite config that is not vite-plus", async () => {
	const dir = await project({
		"vite.config.ts":
			'import { defineConfig } from "vite";\nexport default defineConfig({});\n',
	});
	const found = await detect(dir);
	expect(found.vite).toBe(path.join(dir, "vite.config.ts"));
	expect(found.vitePlus).toBeUndefined();
});

it("detects a vite-plus config", async () => {
	const dir = await project({
		"vite.config.ts":
			'import { defineConfig } from "vite-plus";\nexport default defineConfig({});\n',
	});
	const found = await detect(dir);
	expect(found.vitePlus).toBe(path.join(dir, "vite.config.ts"));
});

it("throws on a malformed config", async () => {
	const dir = await project({ ".oxlintrc.json": "{" });
	await expect(detect(dir)).rejects.toThrow();
});
