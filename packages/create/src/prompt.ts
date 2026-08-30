import path from "node:path";

import { autocompleteMultiselect, select } from "@clack/prompts";

import type { Detected } from "./detect.ts";
import type { Scope, Toolchain } from "./presets.ts";

interface Item<T> {
	value: T;
	label: string;
	hint?: string;
	disabled: boolean;
}

interface Selection {
	selectedValues: Scope[];
}

export interface Chosen {
	toolchain: Toolchain;
}

function detected(...files: (string | undefined)[]): string | undefined {
	const names = files
		.filter((file) => file !== undefined)
		.map((file) => path.basename(file));
	return names.length > 0 ? `found ${names.join(", ")}` : undefined;
}

export function toolchainSelect(found: Detected): {
	message: string;
	initialValue: Toolchain;
	options: Item<Toolchain>[];
} {
	const both = Boolean(found.oxlint ?? found.oxfmt) && Boolean(found.vitePlus);
	return {
		message: both ? "Both toolchains are configured, patch:" : "Toolchain:",
		initialValue: found.vitePlus ? "vite-plus" : "oxlint",
		options: [
			{
				value: "oxlint",
				label: "oxlint + oxfmt",
				hint: detected(found.oxlint, found.oxfmt),
				disabled: false,
			},
			{
				value: "vite-plus",
				label: "vite-plus",
				hint: detected(found.vitePlus),
				disabled: false,
			},
		],
	};
}

export function toolchainPrompter(
	found: Detected,
	chosen: Chosen,
): () => Promise<string> {
	const config = toolchainSelect(found);

	return async () => {
		const picked = await select(config);
		// the scope prompt needs the answer to lock vitest
		if (typeof picked === "string") chosen.toolchain = picked as Toolchain;
		return picked as string;
	};
}

function lock(
	item: Item<Scope>,
	locked: boolean,
	hint: string,
	selected: Scope[],
): Scope[] {
	item.disabled = locked;
	item.hint = locked ? hint : undefined;
	if (!locked || selected.includes(item.value)) return selected;
	return [...selected, item.value];
}

// the list is re-read on every keypress, so mutating items here locks a scope
export function scopeOptions(chosen: Chosen): {
	items: Item<Scope>[];
	options: (this: Selection) => Item<Scope>[];
} {
	const react: Item<Scope> = {
		value: "react",
		label: "React",
		disabled: false,
	};
	const vitest: Item<Scope> = {
		value: "vitest",
		label: "Vitest",
		disabled: false,
	};
	const jest: Item<Scope> = { value: "jest", label: "Jest", disabled: false };
	const items: Item<Scope>[] = [
		react,
		{
			value: "next",
			label: "Next.js",
			hint: "includes React",
			disabled: false,
		},
		{ value: "vue", label: "Vue", disabled: false },
		vitest,
		jest,
	];

	return {
		items,
		options(this: Selection) {
			let selected = this.selectedValues;
			selected = lock(
				react,
				selected.includes("next"),
				"required by Next.js",
				selected,
			);
			selected = lock(
				vitest,
				chosen.toolchain === "vite-plus",
				"comes with vite-plus",
				selected,
			);
			this.selectedValues = selected;
			jest.hint =
				chosen.toolchain === "vite-plus"
					? "vitest comes with vite-plus"
					: undefined;
			return items;
		},
	};
}

export function scopePrompter(
	chosen: Chosen,
): () => Promise<readonly string[]> {
	const { options } = scopeOptions(chosen);

	return async () => {
		const picked = await autocompleteMultiselect({
			message: "Project scope:",
			required: false,
			filter: () => true,
			options,
		});
		// optique checks the cancel symbol on the result
		return picked as readonly string[];
	};
}
