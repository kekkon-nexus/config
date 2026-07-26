const config = {
	"*": ["aubr fmt --check --no-error-on-unmatched-pattern"],
	"*.{js,jsx,ts,tsx,mjs,cjs}": ["aubr lint --no-error-on-unmatched-pattern"],
};

export default config;
