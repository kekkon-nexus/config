import { defineConfig } from "oxlint";

/** n:recommended */
const config = defineConfig({
	rules: {
		"node/callback-return": "off",
		"node/exports-style": "off",
		"node/global-require": "off",
		"node/handle-callback-err": "off",
		"node/no-exports-assign": "error",
		"node/no-mixed-requires": "off",
		"node/no-new-require": "off",
		"node/no-path-concat": "off",
		"node/no-process-env": "off",
		"node/no-sync": "off",
		"node/no-top-level-await": "off",
	},
});

export default config;
