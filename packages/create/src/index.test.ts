import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { expect, it, onTestFinished } from "vite-plus/test";

import { setDefaultExportProp } from "./index.ts";

it("overwrites a default export property value", async () => {
	const dir = await mkdtemp(path.join(tmpdir(), "create-config-"));
	onTestFinished(() => rm(dir, { recursive: true }));

	const file = path.join(dir, "config.ts");
	await writeFile(file, 'export default {\n\tlevel: "warn",\n};\n');

	await setDefaultExportProp(file, "level", '"error"');
	expect(await readFile(file, "utf8")).toBe(
		'export default {\n\tlevel: "error",\n};\n',
	);
});
