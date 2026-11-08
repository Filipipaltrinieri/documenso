import path from 'node:path';
import linguiMacro from '@lingui/babel-plugin-lingui-macro';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

/** @type {import('rollup').RollupOptions} */
const config = {
  /**
   * We specifically target the router.ts instead of the entry point so the rollup doesn't go through the
   * already prebuilt RR7 server files.
   */
  input: 'server/router.ts',
  output: {
    dir: 'build/server/hono',
    format: 'esm',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: '.',
  },
  external: [/node_modules/],
  plugins: [
    typescript({
      noEmitOnError: true,
      moduleResolution: 'bundler',
      include: ['server/**/*', '../../packages/**/*', '../../packages/lib/translations/**/*'],
      // The Vercel SSR entry imports a virtual module owned by the React Router Vite build;
      // this independent Hono Rollup pass must not type-check or emit it.
      exclude: ['server/vercel.ts'],
      jsx: 'preserve',
    }),
    resolve({
      rootDir: path.join(process.cwd(), '../..'),
      preferBuiltins: true,
      resolveOnly: [
        '@documenso/api/*',
        '@documenso/auth/*',
        '@documenso/lib/*',
        '@documenso/trpc/*',
        '@documenso/email/*',
      ],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    }),
    json(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.ts', '.tsx'],
      presets: ['@babel/preset-typescript', ['@babel/preset-react', { runtime: 'automatic' }]],
      plugins: [linguiMacro],
    }),
  ],
};

export default config;
