import { defineConfig } from "oxlint";

import reactRefresh from "./react-refresh.ts";

/** react-refresh:next */
const config = defineConfig({
	extends: [reactRefresh],
	rules: {
		"react/only-export-components": [
			"error",
			{
				allowExportNames: [
					"experimental_ppr",
					"dynamic",
					"dynamicParams",
					"revalidate",
					"fetchCache",
					"runtime",
					"preferredRegion",
					"maxDuration",
					"metadata",
					"generateMetadata",
					"viewport",
					"generateViewport",
					"generateImageMetadata",
					"generateSitemaps",
					"generateStaticParams",
					"instant",
					"contentType",
					"size",
				],
			},
		],
	},
});

export default config;
