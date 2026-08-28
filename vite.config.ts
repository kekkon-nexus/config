import fmt from "@kekkon-nexus/config/oxfmt";
import base from "@kekkon-nexus/config/oxlint";
import vp from "@kekkon-nexus/config/oxlint/vite-plus";
import { defineConfig } from "vite-plus";

export default defineConfig({
	fmt: {
		...fmt,
	},
	lint: {
		extends: [base, vp],
	},
	test: {
		include: ["test/**/*.test.ts"],
	},

	staged: {
		"*": "vp check --fix --no-error-on-unmatched-pattern",
	},
});
