import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { expect, it, onTestFinished } from "vite-plus/test";

import { patchExtends } from "./index.ts";

const oxlint = { local: "oxlint", from: "@kekkon-nexus/config/oxlint" };

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
