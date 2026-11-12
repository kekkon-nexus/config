import vueBase from "@kekkon-nexus/config/oxlint/base/vue";
import vueRecommended from "@kekkon-nexus/config/oxlint/base/vue-recommended";
import vueStronglyRecommended from "@kekkon-nexus/config/oxlint/base/vue-strongly-recommended";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [vueRecommended, vueStronglyRecommended, vueBase],
	plugins: ["vue"],

	rules: {
		"vue/prefer-import-from-vue": "warn",
		"vue/return-in-computed-property": [
			"error",
			{ treatUndefinedAsUnspecified: false },
		],
	},
});

export default config;
