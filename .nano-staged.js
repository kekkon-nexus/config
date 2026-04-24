export default {
	"*": ["bun run fmt --check --no-error-on-unmatched-pattern"],
	"*.{js,jsx,ts,tsx,mjs,cjs}": ["bun run lint --no-error-on-unmatched-pattern"],
};
