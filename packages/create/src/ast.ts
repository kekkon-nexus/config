import {
	type ExportDefaultDeclarationKind,
	type ObjectExpression,
	type ObjectProperty,
	type Program,
} from "oxc-parser";

function keyName(property: ObjectProperty): string | undefined {
	const { key } = property;
	if (key.type === "Identifier") return key.name;
	if ("value" in key) return String(key.value);
	return undefined;
}

export function prop(
	object: ObjectExpression,
	name: string,
): ObjectProperty | undefined {
	for (const property of object.properties) {
		if (property.type !== "Property" || property.computed) continue;
		if (keyName(property) === name) return property;
	}
	return undefined;
}

function objectOf(
	node: ExportDefaultDeclarationKind,
	program: Program,
	seen = new Set<string>(),
): ObjectExpression | undefined {
	if (node.type === "ObjectExpression") return node;
	if (node.type === "CallExpression") {
		const [argument] = node.arguments;
		return argument?.type === "ObjectExpression" ? argument : undefined;
	}
	if (node.type === "Identifier" && !seen.has(node.name)) {
		seen.add(node.name);
		for (const statement of program.body) {
			if (statement.type !== "VariableDeclaration") continue;
			for (const declarator of statement.declarations) {
				if (declarator.id.type !== "Identifier") continue;
				if (declarator.id.name !== node.name || !declarator.init) continue;
				return objectOf(declarator.init, program, seen);
			}
		}
	}
	return undefined;
}

export function defaultExport(program: Program): ObjectExpression | undefined {
	for (const statement of program.body) {
		if (statement.type !== "ExportDefaultDeclaration") continue;
		return objectOf(statement.declaration, program);
	}
	return undefined;
}
