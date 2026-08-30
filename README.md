# @kekkon-nexus/config

[![NPM Version][npm-version-img]][npm-version-url]
[![NPM Downloads][npm-downloads-img]][npm-downloads-url]
[![CI][ci-img]][ci-url]

An opinionated config preset for TypeScript, oxlint, oxfmt and commitlint.

> Inspired by [sxzz](https://github.com/sxzz/eslint-config) and
> [antfu](https://github.com/antfu/eslint-config) 💛

## Features

- Lint and format with oxlint and oxfmt
- Error on correctness, warn on style
- Carries the recommended presets of upstream ESLint plugins
- Opt-in layers for React, Next.js, Vue, Jest and Vitest
- Import sorting in oxfmt you can extend using `sortImports`
- Standalone, or using [Vite+](https://viteplus.dev/)
- Scaffolds in a single script

## Get Started

```sh
npm create @kekkon-nexus/config
```

The script will detect the config files already in the project and
interactively ask for the toolchain and the project scope before writing the
new configs or patching the existing ones.

Requires:

- Node.js >= 24.12
- TypeScript 7

Pass flags to skip the prompts:

| Flag                                     |                                          |
| ---------------------------------------- | ---------------------------------------- |
| `--toolchain oxlint\|vite-plus`          | toolchain to configure                   |
| `--scope jest\|next\|react\|vitest\|vue` | opt-in preset, repeatable                |
| `--install`                              | install the packages afterwards          |
| `--module`                               | add `"type": "module"` to `package.json` |

Or manually:

```sh
npm i -D @kekkon-nexus/config # and other dependencies
```

### Optional Dependencies

| Feature            | Optional Dependency |
| ------------------ | ------------------- |
| Formatting         | `oxfmt`             |
| Linting            | `oxlint`            |
| Type-aware linting | `oxlint-tsgolint`   |
| Unified toolchain  | `vite-plus`         |
| Commit linting     | `@commitlint/cli`   |

## Usage

```ts
// oxlint.config.ts
import oxlint from "@kekkon-nexus/config/oxlint";
import react from "@kekkon-nexus/config/oxlint/react";
import { defineConfig } from "oxlint";

export default defineConfig({
	extends: [oxlint, react],
});
```

```ts
// oxfmt.config.ts
import oxfmt from "@kekkon-nexus/config/oxfmt";
import { defineConfig } from "oxfmt";

export default defineConfig({
	...oxfmt,
});
```

Or one config with Vite+:

```ts
// vite.config.ts
import oxfmt from "@kekkon-nexus/config/oxfmt";
import oxlint from "@kekkon-nexus/config/oxlint";
import vp from "@kekkon-nexus/config/oxlint/vite-plus";
import { defineConfig } from "vite-plus";

export default defineConfig({
	fmt: { ...oxfmt },
	lint: { extends: [oxlint, vp] },
});
```

### Presets

| Import              |                                                   |
| ------------------- | ------------------------------------------------- |
| `oxlint`            | the default set                                   |
| `oxlint/javascript` | core rules, `eslint`, `oxc` and `promise` plugins |
| `oxlint/typescript` | type-aware rules, needs `oxlint-tsgolint`         |
| `oxlint/import`     | import hygiene                                    |
| `oxlint/unicorn`    | modern syntax & API preferences                   |
| `oxlint/jsdoc`      | jsdoc plugin                                      |
| `oxlint/browser`    | browser env, `jsx-a11y` plugin                    |
| `oxlint/node`       | node env, `node` plugin                           |
| `oxlint/react`      | react, react-perf                                 |
| `oxlint/next`       | nextjs, extends `oxlint/react`                    |
| `oxlint/vue`        | vue                                               |
| `oxlint/jest`       | jest                                              |
| `oxlint/vitest`     | vitest                                            |
| `oxlint/vite-plus`  | vite-plus plugin, extends `oxlint/vitest`         |

`@kekkon-nexus/config/oxlint` extends the following:

- `base`
- `javascript`
- `typescript`
- `import`
- `unicorn`
- `jsdoc`
- `browser`
- `node`

`oxlint/base` is the ported upstream recommended presets.  
See [src/oxlint](./src/oxlint) for the rules each one sets.

### TypeScript

```json
{
	"extends": ["@kekkon-nexus/config/ts", "@kekkon-nexus/config/ts/strict"]
}
```

Extend either or both. `ts` sets:

- `composite`
- `module: esnext`
- `noImplicitOverride`
- `noUncheckedIndexedAccess`
- `verbatimModuleSyntax`
- `rewriteRelativeImportExtensions`

`ts/strict` adds:

- `erasableSyntaxOnly`
- `noFallthroughCasesInSwitch`
- `noImplicitReturns`
- `noPropertyAccessFromIndexSignature`
- `noUnusedLocals`
- `noUnusedParameters`

### Import Sorting

Sorts into builtins, externals, internals (`~/`, `@/`, `#/`), relatives,
then side effects.

To slot a group in:

```ts
import oxfmt, { sortImports } from "@kekkon-nexus/config/oxfmt";

export default defineConfig({
	...oxfmt,
	sortImports: sortImports({
		customGroups: [{ groupName: "react", elementNamePattern: ["^react"] }],
		groupsBeforeExternal: [["react"]],
	}),
});
```

### Commitlint

```ts
// commitlint.config.ts
const config = {
	extends: [
		"@kekkon-nexus/config/commitlint",
		"@kekkon-nexus/config/commitlint/gitmoji",
	],
};

export default config;
```

## License

[MIT](./LICENSE) License © Kekkon Nexus

<!-- Badges -->

[npm-version-img]: https://img.shields.io/npm/v/@kekkon-nexus/config.svg
[npm-version-url]: https://npmx.dev/package/@kekkon-nexus/config
[npm-downloads-img]: https://img.shields.io/npm/dm/@kekkon-nexus/config
[npm-downloads-url]: https://www.npmcharts.com/compare/@kekkon-nexus/config?interval=30
[ci-img]: https://github.com/kekkon-nexus/config/actions/workflows/ci.yaml/badge.svg
[ci-url]: https://github.com/kekkon-nexus/config/actions/workflows/ci.yaml
