import pkg from "@kekkon-nexus/config/package.json" with { type: "json" };

const [major, minor, patch = 0] = pkg.version.split(".").map(Number);

const d = new Date();
const yy = d.getUTCFullYear() - 2000;
const mm = d.getUTCMonth() + 1;
const dd = d.getUTCDate();
const next = yy * 10_000 + mm * 100 + dd;

const version = [major, next, next === minor ? patch + 1 : 0].join(".");

const proc = Bun.spawn(["bun", "pm", "version", version], {
	stderr: "inherit",
	stdout: "inherit",
});
process.exit(await proc.exited);
