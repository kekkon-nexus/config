import { defineConfig } from "oxfmt";
import type { SortImportsConfig } from "oxfmt";

export function sortImports({
	customGroups,
	groupsBeforeExternal,
	groupsBeforeInternal,
}: {
	customGroups?: SortImportsConfig["customGroups"];
	groupsBeforeExternal?: SortImportsConfig["groups"];
	groupsBeforeInternal?: SortImportsConfig["groups"];
} = {}): SortImportsConfig {
	return {
		internalPattern: ["~/", "@/", "#/"],
		newlinesBetween: true,

		customGroups,

		groups: [
			["side_effect"],
			["builtin", "type-builtin"],
			...(groupsBeforeExternal ?? []),
			["external", "type-external"],
			...(groupsBeforeInternal ?? []),
			["internal", "subpath", "type-internal", "type-subpath"],
			[
				"parent",
				"sibling",
				"index",
				"type-parent",
				"type-sibling",
				"type-index",
			],
			["style", "side_effect_style"],
			"unknown",
		],
	};
}

const config = defineConfig({
	trailingComma: "all",

	quoteProps: "consistent",
	singleAttributePerLine: true,

	sortImports: sortImports(),
});

export default config;
