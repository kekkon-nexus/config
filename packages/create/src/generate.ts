import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import type { Preset } from "./index.ts";

export type Tool = "oxlint" | "oxfmt";

// both need oxlint-tsgolint, so they are written as a pair
export const TYPE_AWARE =
	"options: {\n\ttypeAware: true,\n\ttypeCheck: true,\n},";

export async function editorconfig(): Promise<string> {
	const source = import.meta.resolve("@kekkon-nexus/config/editorconfig");
	return readFile(fileURLToPath(source), "utf8");
}

export function render(
	tool: Tool,
	presets: readonly Preset[],
	carried: Record<string, unknown> = {},
	typeAware = false,
): string {
	const imports = [
		...presets.map((preset) => `import ${preset.local} from "${preset.from}";`),
		`import { defineConfig } from "${tool}";`,
	];

	const { extends: inherited, ...rest } = carried;
	const locals = presets.map((preset) => preset.local);
	const body =
		tool === "oxfmt"
			? locals.map((local) => `...${local},`)
			: [
					`extends: [${[
						...locals,
						...(Array.isArray(inherited)
							? inherited.map((entry) => JSON.stringify(entry))
							: []),
					].join(", ")}],`,
				];

	if (tool === "oxlint" && typeAware) body.push(TYPE_AWARE);

	for (const [key, value] of Object.entries(rest)) {
		// extends is emitted bare, so quoteProps stays consistent
		const name = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
		body.push(`${name}: ${JSON.stringify(value, undefined, "\t")},`);
	}

	const indented = body.map((entry) =>
		entry
			.split("\n")
			.map((line) => `\t${line}`)
			.join("\n"),
	);
	return `${imports.join("\n")}\n\nexport default defineConfig({\n${indented.join("\n")}\n});\n`;
}

export async function create(
	target: string,
	tool: Tool,
	presets: readonly Preset[],
	typeAware = false,
): Promise<void> {
	// wx so a config the detection missed is never clobbered
	await writeFile(target, render(tool, presets, {}, typeAware), { flag: "wx" });
}

export async function convert(
	json: string,
	target: string,
	tool: Tool,
	presets: readonly Preset[],
	typeAware = false,
): Promise<void> {
	const carried = JSON.parse(await readFile(json, "utf8")) as Record<
		string,
		unknown
	>;
	await writeFile(target, render(tool, presets, carried, typeAware));
	// the ts/js config takes priority, the json would be ignored
	await rm(json);
}

export function renderVitePlus(
	lint: readonly Preset[],
	fmt: Preset,
	typeAware = false,
): string {
	const imports = [...lint, fmt]
		.toSorted((a, b) => a.from.localeCompare(b.from))
		.map((preset) => `import ${preset.local} from "${preset.from}";`);
	imports.push(`import { defineConfig } from "vite-plus";`);

	const extend = `extends: [${lint.map((preset) => preset.local).join(", ")}],`;
	const section = typeAware
		? `{\n\t\t${extend}\n${TYPE_AWARE.split("\n")
				.map((line) => `\t\t${line}`)
				.join("\n")}\n\t}`
		: `{ ${extend.slice(0, -1)} }`;

	return `${imports.join("\n")}

export default defineConfig({
	fmt: { ...${fmt.local} },
	lint: ${section},
});
`;
}
