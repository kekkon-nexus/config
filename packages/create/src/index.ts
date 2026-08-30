import { readFile, writeFile } from "node:fs/promises";

import { MagicString } from "magic-string";
import { type ObjectExpression, parseSync } from "oxc-parser";

import { defaultExport, prop } from "./ast.ts";

export interface Preset {
	local: string;
	from: string;
}

function indentOf(code: string, offset: number): string {
	const line = code.lastIndexOf("\n", offset) + 1;
	return /^[\t ]*/.exec(code.slice(line, offset))?.[0] ?? "";
}

function insert(
	s: MagicString,
	code: string,
	object: ObjectExpression,
	entry: string,
): void {
	const [first] = object.properties;
	const outer = indentOf(code, object.start);
	const sameLine =
		first && !code.slice(object.start, first.start).includes("\n");
	const inner = first && !sameLine ? indentOf(code, first.start) : `${outer}\t`;
	s.appendRight(
		object.start + 1,
		`\n${inner}${entry}${first ? "" : `\n${outer}`}`,
	);
}

async function edit(
	file: string,
	presets: readonly Preset[],
	mutate: (s: MagicString, root: ObjectExpression, code: string) => void,
): Promise<void> {
	const code = await readFile(file, "utf8");
	// filename drives the dialect, no parser options needed
	const { program, errors } = parseSync(file, code);
	if (errors.length > 0) {
		throw new Error(errors.map((e) => e.message).join("\n"));
	}

	const root = defaultExport(program);
	if (!root) throw new Error(`no default exported object in ${file}`);

	const s = new MagicString(code);
	mutate(s, root, code);

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

export async function patchExtends(
	file: string,
	presets: readonly Preset[],
	under?: string,
): Promise<void> {
	const locals = presets.map((preset) => preset.local);

	await edit(file, presets, (s, root, code) => {
		let target = root;

		if (under) {
			const nested = prop(root, under);
			if (!nested) {
				insert(s, code, root, `${under}: { extends: [${locals.join(", ")}] },`);
			} else if (nested.value.type === "ObjectExpression") {
				target = nested.value;
			} else {
				throw new Error(`${under} in ${file} is not an object literal`);
			}
		}

		if (!under || target !== root) {
			const list = prop(target, "extends");
			if (!list) {
				insert(s, code, target, `extends: [${locals.join(", ")}],`);
			} else if (list.value.type === "ArrayExpression") {
				const present = new Set(
					list.value.elements.map((element) =>
						element?.type === "Identifier" ? element.name : undefined,
					),
				);
				const missing = locals.filter((local) => !present.has(local));
				if (missing.length > 0) {
					const separator = list.value.elements.length > 0 ? ", " : "";
					s.appendLeft(list.value.end - 1, `${separator}${missing.join(", ")}`);
				}
			} else {
				throw new Error(`extends in ${file} is not an array literal`);
			}
		}
	});
}

export async function patchSpread(
	file: string,
	preset: Preset,
	under?: string,
): Promise<void> {
	await edit(file, [preset], (s, root, code) => {
		let target = root;

		if (under) {
			const nested = prop(root, under);
			if (!nested) {
				insert(s, code, root, `${under}: { ...${preset.local} },`);
				return;
			}
			if (nested.value.type !== "ObjectExpression") {
				throw new Error(`${under} in ${file} is not an object literal`);
			}
			target = nested.value;
		}

		const spread = target.properties.some(
			(property) =>
				property.type === "SpreadElement" &&
				property.argument.type === "Identifier" &&
				property.argument.name === preset.local,
		);
		if (!spread) insert(s, code, target, `...${preset.local},`);
	});
}
