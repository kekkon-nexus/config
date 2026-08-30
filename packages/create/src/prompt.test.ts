import { expect, it } from "vite-plus/test";

import type { Scope } from "./presets.ts";
import { scopeOptions, toolchainSelect } from "./prompt.ts";

it("locks react on once next is picked", () => {
	const { items, options } = scopeOptions({ toolchain: "oxlint" });
	const state = { selectedValues: ["next"] as Scope[] };

	options.call(state);

	expect(state.selectedValues).toEqual(["next", "react"]);
	expect(items[0]).toMatchObject({
		value: "react",
		disabled: true,
		hint: "required by Next.js",
	});
});

it("releases react when next is unpicked", () => {
	const { items, options } = scopeOptions({ toolchain: "oxlint" });
	const state = { selectedValues: ["react"] as Scope[] };

	options.call(state);

	expect(items[0]).toMatchObject({ value: "react", disabled: false });
	expect(state.selectedValues).toEqual(["react"]);
});

it("leaves jest selectable under vite-plus, with a hint", () => {
	const { items, options } = scopeOptions({ toolchain: "vite-plus" });
	const state = { selectedValues: [] as Scope[] };

	options.call(state);

	expect(items[4]).toMatchObject({
		value: "jest",
		disabled: false,
		hint: "vitest comes with vite-plus",
	});
});

it("locks vitest on under vite-plus", () => {
	const { items, options } = scopeOptions({ toolchain: "vite-plus" });
	const state = { selectedValues: [] as Scope[] };

	options.call(state);

	expect(state.selectedValues).toEqual(["vitest"]);
	expect(items[3]).toMatchObject({
		value: "vitest",
		disabled: true,
		hint: "comes with vite-plus",
	});
});

it("hints which configs were detected", () => {
	expect(toolchainSelect({ oxlint: "/p/.oxlintrc.json" })).toMatchObject({
		message: "Toolchain:",
		initialValue: "oxlint",
		options: [
			{ value: "oxlint", hint: "found .oxlintrc.json" },
			{ value: "vite-plus", hint: undefined },
		],
	});
	expect(
		toolchainSelect({
			oxlint: "/p/.oxlintrc.json",
			vitePlus: "/p/vite.config.ts",
		}).message,
	).toBe("Both toolchains are configured, patch:");
});
