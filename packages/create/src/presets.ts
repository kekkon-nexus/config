import type { Preset } from "./index.ts";

export const OXLINT: Preset = {
	local: "oxlint",
	from: "@kekkon-nexus/config/oxlint",
};
export const OXFMT: Preset = {
	local: "oxfmt",
	from: "@kekkon-nexus/config/oxfmt",
};
export const VITE_PLUS: Preset = {
	local: "vp",
	from: "@kekkon-nexus/config/oxlint/vite-plus",
};

export type Toolchain = "oxlint" | "vite-plus";

export const SCOPES = {
	jest: { local: "jest", from: "@kekkon-nexus/config/oxlint/jest" },
	next: { local: "next", from: "@kekkon-nexus/config/oxlint/next" },
	react: { local: "react", from: "@kekkon-nexus/config/oxlint/react" },
	vitest: { local: "vitest", from: "@kekkon-nexus/config/oxlint/vitest" },
	vue: { local: "vue", from: "@kekkon-nexus/config/oxlint/vue" },
} satisfies Record<string, Preset>;

export type Scope = keyof typeof SCOPES;

export function scopePresets(scopes: readonly Scope[]): Preset[] {
	const picked = new Set(scopes);
	// next already extends react
	if (picked.has("next")) picked.delete("react");
	return [...picked].map((scope) => SCOPES[scope]);
}
