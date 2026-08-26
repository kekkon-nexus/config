import react from "@kekkon-nexus/config/oxlint/react";
import { defineConfig } from "oxlint";

const config = defineConfig({
	extends: [react],
	plugins: ["nextjs"],
});

export default config;
