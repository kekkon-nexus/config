import { readFile, writeFile } from "node:fs/promises";

import { MagicString } from "magic-string";
import { parseSync } from "oxc-parser";

import { defaultExport, prop } from "./ast.ts";

export interface Preset {
	local: string;
	from: string;
}

export async function patchExtends(
	file: string,
	presets: readonly Preset[],
	under?: string,
): Promise<void> {
	const code = await readFile(file, "utf8");
	// filename drives the dialect (js/ts/tsx), so no parser options are needed
	const { program, errors } = parseSync(file, code);
	if (errors.length > 0) {
		throw new Error(errors.map((e) => e.message).join("\n"));
	}

	const root = defaultExport(program);
	if (!root) throw new Error(`no default exported object in ${file}`);

	const s = new MagicString(code);

	const locals = presets.map((preset) => preset.local);
	let target = root;

	if (under) {
		const nested = prop(root, under);
		if (!nested) {
			s.appendRight(
				root.start + 1,
				`${under}:{extends:[${locals.join(",")}]},`,
			);
		} else if (nested.value.type === "ObjectExpression") {
			target = nested.value;
		} else {
			throw new Error(`${under} in ${file} is not an object literal`);
		}
	}

	if (target !== root || !under) {
		const list = prop(target, "extends");
		if (!list) {
			s.appendRight(target.start + 1, `extends:[${locals.join(",")}],`);
		} else if (list.value.type === "ArrayExpression") {
			const present = new Set(
				list.value.elements.map((element) =>
					element?.type === "Identifier" ? element.name : undefined,
				),
			);
			const missing = locals.filter((local) => !present.has(local));
			if (missing.length > 0) {
				const separator = list.value.elements.length > 0 ? "," : "";
				s.appendLeft(list.value.end - 1, `${separator}${missing.join(",")}`);
			}
		} else {
			throw new Error(`extends in ${file} is not an array literal`);
		}
	}

	const imported = new Set(
		program.body
			.filter((statement) => statement.type === "ImportDeclaration")
			.map((statement) => statement.source.value),
	);
	const added = presets
		.filter((preset) => !imported.has(preset.from))
		.map((preset) => `import ${preset.local} from "${preset.from}";\n`)
		.join("");
	if (added) {
		const last = program.body.findLast(
			(statement) => statement.type === "ImportDeclaration",
		);
		if (last) s.appendLeft(last.end, `\n${added.trimEnd()}`);
		else s.appendRight(0, added);
	}

	await writeFile(file, s.toString());
}
