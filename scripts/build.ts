import chalk from 'chalk';
import { execSync } from 'child_process';
import { existsSync, promises as fsPromises } from 'fs';
import tsup, { Options } from 'tsup';
import { InlineCSSPlugin } from './inline-css-plugin.js';

const command = process.argv[2];
const buildType = command === 'watch' ? 'watch' : 'build';

console.log('Building the project...');

const outdir = 'dist';

import pkgJson from '../package.json' assert { type: 'json' };

const peerdependencies: string[] = [];
for (const property in pkgJson.peerdependencies) {
  peerdependencies.push(property);
}

// ---- the options ----

const options = {
  clean: false,
  target: 'es2017',
  dts: true,
  format: ['esm'],
  entryPoints: [
    // NOTE: Entry points must be mapped in package.json > exports, otherwise users won't be able to import them!
    './src/lib/qti-components/index.ts',
    './src/lib/qti-transformers/index.ts'
  ],
  // external: peerdependencies, // ['@lit/react', '@lit/context', 'react', 'lit'],
  splitting: true,
  esbuildPlugins: [InlineCSSPlugin],
  outDir: 'dist'
} as Options;

export const watchOptions = {
  ...options,
  clean: true,
  sourcemap: 'inline',
  define: {
    'process.env.NODE_ENV': '"development"',
    DEBUG: 'true'
  }
} as Options;

export const buildOptions = {
  ...options,
  minify: true,
  bundle: true,
  pure: ['console.log'],
  drop: ['console', 'debugger'],
  define: {
    'process.env.NODE_ENV': '"production"',
    DEBUG: 'false'
  }
} as Options;

export const debugOptions = {
  ...options,
  pure: [],
  bundle: true,
  define: {
    'process.env.NODE_ENV': '"production"',
    DEBUG: 'true'
  },
  outDir: 'dist/debug'
} as Options;

// Make a build purely for enjoying creating qti-items in a plain HTML file
export const completeOptions = {
  ...options,
  dts: false,
  external: [],
  noExternal: [/(.*)/],
  splitting: false,
  sourcemap: false,
  minify: true,
  bundle: true,
  entryPoints: ['./src/index.ts'],
  pure: ['console.log'],
  drop: ['console', 'debugger'],
  define: {
    'process.env.NODE_ENV': '"production"',
    DEBUG: 'false'
  }
} as Options;

// ---- the build ----

(async () => {
  try {
    // make sure the folder is clean
    if (existsSync(outdir)) {
      await fsPromises.rm(outdir, { recursive: true });
    }
    await fsPromises.mkdir(outdir);
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }

  switch (buildType) {
    case 'watch':
      {
        await buildTS(watchOptions);
        buildCSS();
      }
      break;
    case 'build':
      {
        await buildTS(buildOptions);
        await buildTS(debugOptions);
        await buildTS(completeOptions);
        buildCEM();
        buildCSS();
      }
      break;
    default:
      break;
  }
})();

function buildCSS() {
  try {
    execSync(`ts-node --esm --project tsconfig.node.json scripts/make-css.ts --outdir "${outdir}"`, {
      stdio: 'inherit'
    });
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }
}

function buildCEM() {
  try {
    console.log('Generating component metadata');
    execSync(`cem analyze --litelement --outdir "dist"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }
}

async function buildTS(options: Options) {
  return tsup
    .build(options)
    .catch(err => {
      console.error(chalk.red(err));
      process.exit(1);
    })
    .then(result => {
      console.log(result);
      console.log(chalk.green(`qti-components has been generated at ${outdir}\n`));
    });
}
