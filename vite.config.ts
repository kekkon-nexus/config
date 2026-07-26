import oxfmt from "@kekkon-nexus/config/oxfmt";
import oxlint from "@kekkon-nexus/config/oxlint";
import { defineConfig } from "vite-plus";

export default defineConfig({
	fmt: {
		...oxfmt,
	},
	lint: {
		extends: [oxlint],
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],

		rules: {
			"vite-plus/prefer-vite-plus-imports": "error",
		},
	},
	staged: {
		"*": "vp check --fix --no-error-on-unmatched-pattern",
	},
});
