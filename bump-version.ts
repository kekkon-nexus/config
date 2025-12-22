import pkg from "./package.json" with { type: "json" };

const [major, minor, patch = 0] = pkg.version.split(".").map(Number);
const prev = Number(minor);

const d = new Date();
const yy = d.getUTCFullYear() - 2000;
const mm = d.getUTCMonth() + 1;
const dd = d.getUTCDate();
const next = yy * 10000 + mm * 100 + dd;

const version = [major, next, prev === next ? patch + 1 : 0].join(".");

const proc = Bun.spawn(["bun", "pm", "version", version], {
	stdout: "inherit",
	stderr: "inherit",
});
await proc.exited;
process.exit(proc.exitCode ?? 1);
