import { defineConfig } from "oxlint";

const config = defineConfig({
	rules: {
		// import:recommended
		"import/consistent-type-specifier-style": "off",
		"import/default": "error",
		"import/export": "error",
		"import/exports-last": "off",
		"import/extensions": "off",
		"import/first": "off",
		"import/group-exports": "off",
		"import/max-dependencies": "off",
		"import/named": "error",
		"import/namespace": "error",
		"import/newline-after-import": "off",
		"import/no-absolute-path": "off",
		"import/no-amd": "off",
		"import/no-anonymous-default-export": "off",
		"import/no-commonjs": "off",
		"import/no-cycle": "off",
		"import/no-default-export": "off",
		"import/no-duplicates": "warn",
		"import/no-dynamic-require": "off",
		"import/no-empty-named-blocks": "off",
		"import/no-mutable-exports": "off",
		"import/no-named-as-default": "warn",
		"import/no-named-as-default-member": "warn",
		"import/no-named-default": "off",
		"import/no-named-export": "off",
		"import/no-namespace": "off",
		"import/no-nodejs-modules": "off",
		"import/no-relative-parent-imports": "off",
		"import/no-self-import": "off",
		"import/no-unassigned-import": "off",
		"import/no-webpack-loader-syntax": "off",
		"import/prefer-default-export": "off",
		"import/unambiguous": "off",
	},
});

export default config;
