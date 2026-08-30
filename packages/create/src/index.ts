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

const TYPE_AWARE = ["typeAware", "typeCheck"] as const;

function patchOptions(
	s: MagicString,
	code: string,
	target: ObjectExpression,
	file: string,
): void {
	const options = prop(target, "options");
	if (!options) {
		insert(s, code, target, "options: { typeAware: true, typeCheck: true },");
		return;
	}
	if (options.value.type !== "ObjectExpression") {
		throw new Error(`options in ${file} is not an object literal`);
	}

	const object = options.value;
	const missing = TYPE_AWARE.filter((key) => !prop(object, key));
	// one insert, so an empty object only gets closed once
	if (missing.length > 0) {
		insert(s, code, object, missing.map((key) => `${key}: true,`).join(" "));
	}
}

export async function patchExtends(
	file: string,
	presets: readonly Preset[],
	under?: string,
	typeAware = false,
): Promise<void> {
	const locals = presets.map((preset) => preset.local);
	const section = [
		`extends: [${locals.join(", ")}]`,
		...(typeAware ? ["options: { typeAware: true, typeCheck: true }"] : []),
	].join(", ");

	await edit(file, presets, (s, root, code) => {
		let target = root;

		if (under) {
			const nested = prop(root, under);
			if (!nested) {
				insert(s, code, root, `${under}: { ${section} },`);
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

			if (typeAware) patchOptions(s, code, target, file);
		}
	});
}

export async function patchTsconfig(
	file: string,
	presets: readonly string[],
): Promise<void> {
	const code = await readFile(file, "utf8");
	// jsonc is a subset of js object literals, so the ts parser reads it
	const prefix = "export default ";
	const wrapped = `${prefix}${code}`;
	const { program, errors } = parseSync("tsconfig.ts", wrapped);
	if (errors.length > 0) {
		throw new Error(`${file}: ${errors.map((e) => e.message).join("\n")}`);
	}

	const root = defaultExport(program);
	if (!root) throw new Error(`${file} is not an object literal`);

	const s = new MagicString(wrapped);
	const list = prop(root, "extends");
	const quote = (entries: readonly string[]): string =>
		entries.map((entry) => JSON.stringify(entry)).join(", ");

	if (!list) {
		insert(s, wrapped, root, `"extends": [${quote(presets)}],`);
	} else if (list.value.type === "ArrayExpression") {
		const present = new Set(
			list.value.elements.map((element) =>
				element?.type === "Literal" ? element.value : undefined,
			),
		);
		const missing = presets.filter((preset) => !present.has(preset));
		if (missing.length > 0) {
			const separator = list.value.elements.length > 0 ? ", " : "";
			s.appendLeft(list.value.end - 1, `${separator}${quote(missing)}`);
		}
	} else if (
		list.value.type === "Literal" &&
		typeof list.value.value === "string"
	) {
		const inherited = list.value.value;
		s.overwrite(
			list.value.start,
			list.value.end,
			`[${quote([inherited, ...presets.filter((preset) => preset !== inherited)])}]`,
		);
	} else {
		throw new Error(`extends in ${file} is not a string or array`);
	}

	await writeFile(file, s.toString().slice(prefix.length));
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
