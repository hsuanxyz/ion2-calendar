/* global process */

import buble from 'rollup-plugin-buble'
import { readFileSync } from 'fs';

const inDevelopment = () =>
  process.env.BUILD_ENV &&
  ['development', 'dev', 'develop'].indexOf(process.env.BUILD_ENV.toLowerCase()) >= 0


const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

const rollupOpts = {
  entry: pkg.module,
  format: 'cjs',
  external: Object.keys(pkg.dependencies),
  plugins: [
    buble({
      include: pkg.module,
      transforms: { dangerousForOf: true }
    })
  ],
  dest: pkg.main
}

if (inDevelopment()) {
  rollupOpts.sourceMap = 'inline'
}

export default rollupOpts
