import { readFile } from "node:fs/promises";
import Module, { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vite-plus/test";

// typescript-eslint 8 rejects TS 7 and its require() sits below the module graph.
// https://github.com/typescript-eslint/typescript-eslint/issues/10940
const loader = Module as unknown as {
	_load: (request: string, ...rest: unknown[]) => unknown;
};
const load = loader._load;
loader._load = function (this: unknown, request: string, ...rest: unknown[]) {
	return load.call(
		this,
		request === "typescript" ? "typescript6" : request,
		...rest,
	);
};

interface Config {
	rules?: Record<string, unknown>;
}
interface Preset {
	target: string;
	sources: Source[];
}
interface Source {
	src: string;
	preset: string;
	prefix: string;
	severity?: string;
}

const levels: Record<string, string> = {
	0: "off",
	1: "warn",
	2: "error",
	off: "off",
	warn: "warn",
	error: "error",
};

const severity = (value: unknown) =>
	levels[String(Array.isArray(value) ? value[0] : value)] ?? "off";

const rulesOf = (config: Config | Config[]): Record<string, unknown> =>
	Array.isArray(config)
		? Object.assign({}, ...config.map((entry) => entry.rules ?? {}))
		: (config.rules ?? {});

const rename = (name: string, from: string, to: string) => {
	if (from === "") return name.includes("/") ? undefined : name;
	return name.startsWith(from) ? to + name.slice(from.length) : undefined;
};

const upstreamOf = async (sources: Source[], target: string) => {
	const expected: Record<string, string> = {};
	// empty when no source exposes a rules map, which makes removal undetectable
	const shipped = new Set<string>();
	for (const source of sources) {
		const mod = (await import(source.src)) as {
			default?: unknown;
		};
		const root = (mod.default ?? mod) as {
			configs: Record<string, Config | Config[]>;
			rules?: Record<string, unknown>;
			plugin?: { rules?: Record<string, unknown> };
		};
		const config = root.configs[source.preset];
		if (config === undefined) {
			throw new Error(`${source.src} has no configs.${source.preset}`);
		}
		for (const rule of Object.keys(root.rules ?? root.plugin?.rules ?? {})) {
			shipped.add(target + rule);
		}
		for (const [rule, value] of Object.entries(rulesOf(config))) {
			const mapped = rename(rule, source.prefix, target);
			if (mapped === undefined) continue;
			const level = severity(value);
			expected[mapped] = level === "off" ? level : (source.severity ?? level);
		}
	}
	return { expected, shipped };
};

const documentedRules = async (name: string) => {
	const src = await readFile(
		path.join(import.meta.dirname, "../src/oxlint/base", `${name}.ts`),
		"utf8",
	);
	return new Set(
		[...src.matchAll(/^\t*"([^"]+)":.*,\s*\/\//gm)].map(([, rule]) => rule),
	);
};

const schemaPath = path.join(
	path.dirname(createRequire(import.meta.url).resolve("oxlint/package.json")),
	"configuration_schema.json",
);
const schema = JSON.parse(await readFile(schemaPath, "utf8")) as {
	definitions: {
		DummyRuleMap: {
			properties: Record<string, unknown>;
		};
	};
};
const implemented = new Set(
	Object.keys(schema.definitions.DummyRuleMap.properties),
);

const presets: Record<string, Preset> = {
	"eslint": {
		target: "",
		sources: [
			{
				src: "@eslint/js",
				preset: "recommended",
				prefix: "",
			},
		],
	},
	"import": {
		target: "import/",
		sources: [
			{
				src: "eslint-plugin-import-x",
				preset: "flat/recommended",
				prefix: "import-x/",
			},
		],
	},
	"jest": {
		target: "jest/",
		sources: [
			{
				src: "eslint-plugin-jest",
				preset: "flat/recommended",
				prefix: "jest/",
			},
		],
	},
	"jsdoc": {
		target: "jsdoc/",
		sources: [
			{
				src: "eslint-plugin-jsdoc",
				preset: "flat/recommended",
				prefix: "jsdoc/",
				severity: "warn",
			},
		],
	},
	"jsx-a11y": {
		target: "jsx-a11y/",
		sources: [
			{
				src: "eslint-plugin-jsx-a11y",
				preset: "recommended",
				prefix: "jsx-a11y/",
			},
		],
	},
	"next": {
		target: "nextjs/",
		sources: [
			{
				src: "@next/eslint-plugin-next",
				preset: "recommended",
				prefix: "@next/next/",
			},
			{
				src: "@next/eslint-plugin-next",
				preset: "core-web-vitals",
				prefix: "@next/next/",
			},
		],
	},
	"node": {
		target: "node/",
		sources: [
			{
				src: "eslint-plugin-n",
				preset: "flat/recommended",
				prefix: "n/",
			},
		],
	},
	"promise": {
		target: "promise/",
		sources: [
			{
				src: "eslint-plugin-promise",
				preset: "flat/recommended",
				prefix: "promise/",
			},
		],
	},
	"react": {
		target: "react/",
		sources: [
			{
				src: "eslint-plugin-react",
				preset: "recommended",
				prefix: "react/",
			},
			{
				src: "eslint-plugin-react",
				preset: "jsx-runtime",
				prefix: "react/",
			},
			{
				src: "eslint-plugin-react-hooks",
				preset: "recommended",
				prefix: "react-hooks/",
			},
			{
				src: "eslint-plugin-react-refresh",
				preset: "recommended",
				prefix: "react-refresh/",
			},
		],
	},
	"react-perf": {
		target: "react-perf/",
		sources: [
			{
				src: "eslint-plugin-react-perf",
				preset: "recommended",
				prefix: "react-perf/",
			},
		],
	},
	"typescript": {
		target: "typescript/",
		sources: [
			{
				src: "typescript-eslint",
				preset: "strictTypeChecked",
				prefix: "@typescript-eslint/",
			},
			{
				src: "typescript-eslint",
				preset: "stylisticTypeChecked",
				prefix: "@typescript-eslint/",
				severity: "warn",
			},
		],
	},
	"unicorn": {
		target: "unicorn/",
		sources: [
			{
				src: "eslint-plugin-unicorn",
				preset: "recommended",
				prefix: "unicorn/",
			},
		],
	},
	"vitest": {
		target: "vitest/",
		sources: [
			{
				src: "@vitest/eslint-plugin",
				preset: "recommended",
				prefix: "vitest/",
			},
		],
	},
	// vue flat configs are cumulative, error is applied last
	"vue": {
		target: "vue/",
		sources: [
			{
				src: "eslint-plugin-vue",
				preset: "flat/recommended",
				prefix: "vue/",
				severity: "warn",
			},
			{
				src: "eslint-plugin-vue",
				preset: "flat/strongly-recommended",
				prefix: "vue/",
				severity: "warn",
			},
			{
				src: "eslint-plugin-vue",
				preset: "flat/essential",
				prefix: "vue/",
			},
		],
	},
};

describe("base", async () => {
	const results = await Promise.all(
		Object.entries(presets).map(async ([name, preset]) => {
			const mod = (await import(`../src/oxlint/base/${name}.ts`)) as {
				default: {
					rules?: Record<string, unknown>;
				};
			};
			const actual = mod.default.rules ?? {};
			const { expected, shipped } = await upstreamOf(
				preset.sources,
				preset.target,
			);
			const documented = await documentedRules(name);

			const rules = new Set([
				...Object.keys(actual),
				...Object.keys(expected).filter((rule) => implemented.has(rule)),
			]);

			const drift = [...rules]
				.map((rule) => [
					rule,
					severity(actual[rule] ?? "off"),
					expected[rule] ?? "off",
				])
				.filter(([, base, upstream]) => base !== upstream)
				.map(
					([rule, base, upstream]) =>
						`${rule}: base=${base} upstream=${upstream}`,
				)
				.toSorted();

			return {
				name,
				drift,
				undocumented:
					shipped.size === 0
						? []
						: Object.keys(actual)
								.filter((rule) => !shipped.has(rule) && !documented.has(rule))
								.toSorted(),
				unimplemented: Object.keys(expected)
					.filter(
						(rule) =>
							!(rule in actual) &&
							!implemented.has(rule) &&
							expected[rule] !== "off",
					)
					.toSorted(),
			};
		}),
	);

	describe.each(results)("$name", ({ drift, undocumented, unimplemented }) => {
		it("mirrors upstream", () => {
			expect(drift).toEqual([]);
		});

		it("documents rules dropped upstream", () => {
			expect(undocumented).toEqual([]);
		});

		// oxlint-disable-next-line vitest/expect-expect, vitest/no-disabled-tests
		it.skip.each(unimplemented)("%s", () => {});
	});
});
