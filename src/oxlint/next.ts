import reactRefreshNext from "@kekkon-nexus/config/oxlint/base/react-refresh-next";
import react from "@kekkon-nexus/config/oxlint/react";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [react, reactRefreshNext],
	plugins: ["nextjs"],
});

export default config;
