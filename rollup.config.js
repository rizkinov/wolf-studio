import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import { defineConfig } from 'rollup';
import { createRequire } from 'module';
import babel from '@rollup/plugin-babel';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.lib.json',
        exclude: [
          'app/**/*',
          'components/**/*',
          'config/**/*',
          '**/*.stories.tsx',
          '**/*.test.tsx',
          'node_modules/**/*',
          '.next/**/*'
        ],
        declarationDir: './dist/types',
        declaration: true,
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        presets: [
          '@babel/preset-env',
          '@babel/preset-react',
          '@babel/preset-typescript'
        ]
      }),
      postcss({
        config: {
          path: './postcss.config.cjs',
        },
        extensions: ['.css'],
        minimize: true,
        inject: {
          insertAt: 'top',
        },
      }),
    ],
    external: [
      'react',
      'react-dom',
      'next',
      'next-themes',
      'next/link',
      'next/image',
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ],
  }
]); 