const { copyFileSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
copyFileSync(
  resolve(root, 'node_modules/plotly.js-dist-min/plotly.min.js'),
  resolve(root, 'assets/js/plotly.min.js')
);
