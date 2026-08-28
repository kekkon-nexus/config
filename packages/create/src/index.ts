#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import MagicString from "magic-string";
import { parseSync, Visitor } from "oxc-parser";

export async function setDefaultExportProp(
	file: string,
	key: string,
	literal: string,
): Promise<void> {
	const code = await readFile(file, "utf8");
	// filename drives the dialect (js/ts/tsx), so no parser options are needed
	const { program, errors } = parseSync(file, code);
	if (errors.length > 0) {
		throw new Error(errors.map((e) => e.message).join("\n"));
	}

	const s = new MagicString(code);
	let found = false;

	new Visitor({
		ExportDefaultDeclaration(node) {
			if (node.declaration.type !== "ObjectExpression") return;
			for (const prop of node.declaration.properties) {
				if (prop.type !== "Property" || prop.computed) continue;
				const { key: k } = prop;
				const name =
					k.type === "Identifier"
						? k.name
						: "value" in k
							? String(k.value)
							: undefined;
				if (name !== key) continue;
				s.overwrite(prop.value.start, prop.value.end, literal);
				found = true;
			}
		},
	}).visit(program);

	if (!found) throw new Error(`${key} not found in default export of ${file}`);

	await writeFile(file, s.toString());
}

if (import.meta.main) {
	const [file, key, literal] = process.argv.slice(2);
	if (!file || !key || literal === undefined) {
		console.error("usage: create-config <file> <key> <literal>");
		// oxlint-disable-next-line unicorn/no-process-exit
		process.exit(1);
	}
	await setDefaultExportProp(file, key, literal);
}
