import { defineConfig } from "oxlint";

/** react-refresh:next */
const config = defineConfig({
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
