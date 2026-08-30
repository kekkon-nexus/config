import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it, onTestFinished } from "vite-plus/test";

import { patchExtends, patchTsconfig } from "./index.ts";

const oxlint = { local: "oxlint", from: "@kekkon-nexus/config/oxlint" };

describe("patchExtends", () => {
	async function patch(source: string, under?: string): Promise<string> {
		const dir = await mkdtemp(path.join(tmpdir(), "create-config-"));
		onTestFinished(() => rm(dir, { recursive: true }));

		const file = path.join(dir, "config.ts");
		await writeFile(file, source);
		await patchExtends(file, [oxlint], under);
		return await readFile(file, "utf8");
	}

	it("appends to an existing extends array", async () => {
		expect(
			await patch(
				'import base from "./base.ts";\n' +
					"const config = defineConfig({ extends: [base] });\n" +
					"export default config;\n",
			),
		).toBe(
			'import base from "./base.ts";\n' +
				'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
				"const config = defineConfig({ extends: [base, oxlint] });\n" +
				"export default config;\n",
		);
	});

	it("inserts extends when absent", async () => {
		expect(await patch("export default defineConfig({});\n")).toBe(
			'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
				"export default defineConfig({\n\textends: [oxlint],\n});\n",
		);
	});

	it("inserts a nested section when absent", async () => {
		expect(await patch("export default { test: {} };\n", "lint")).toBe(
			'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
				"export default {\n\tlint: { extends: [oxlint] }, test: {} };\n",
		);
	});

	it("skips presets already extended", async () => {
		const source =
			'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
			"export default { extends: [oxlint] };\n";
		expect(await patch(source)).toBe(source);
	});

	it("throws on a missing default export", async () => {
		await expect(patch("const config = {};\n")).rejects.toThrow(
			"no default exported object",
		);
	});

	it("matches a string literal key", async () => {
		expect(await patch('export default { "extends": [] };\n')).toBe(
			'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
				'export default { "extends": [oxlint] };\n',
		);
	});

	it("ignores spread properties", async () => {
		expect(await patch("export default { ...base };\n")).toBe(
			'import oxlint from "@kekkon-nexus/config/oxlint";\n' +
				"export default {\n\textends: [oxlint], ...base };\n",
		);
	});

	it("throws on a cyclic default export", async () => {
		await expect(
			patch("const a = b;\nconst b = a;\nexport default a;\n"),
		).rejects.toThrow("no default exported object");
	});
});

describe("patchTsconfig", () => {
	async function patch(source: string): Promise<string> {
		const dir = await mkdtemp(path.join(tmpdir(), "create-config-"));
		onTestFinished(() => rm(dir, { recursive: true }));

		const file = path.join(dir, "tsconfig.json");
		await writeFile(file, source);
		await patchTsconfig(file, ["@kekkon-nexus/config/ts"]);
		return await readFile(file, "utf8");
	}

	it("keeps comments", async () => {
		expect(await patch('{\n\t// keep me\n\t"compilerOptions": {}\n}\n')).toBe(
			'{\n\t"extends": ["@kekkon-nexus/config/ts"],\n\t// keep me\n\t"compilerOptions": {}\n}\n',
		);
	});

	it("appends to an existing extends array", async () => {
		expect(await patch('{ "extends": ["./base.json"] }\n')).toBe(
			'{ "extends": ["./base.json", "@kekkon-nexus/config/ts"] }\n',
		);
	});

	it("widens a string extends", async () => {
		expect(await patch('{ "extends": "./base.json" }\n')).toBe(
			'{ "extends": ["./base.json", "@kekkon-nexus/config/ts"] }\n',
		);
	});

	it("skips a preset already extended", async () => {
		const source = '{ "extends": ["@kekkon-nexus/config/ts"] }\n';
		expect(await patch(source)).toBe(source);
	});
});
