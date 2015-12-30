var fs = require('fs')
  //, entries = JSON.parse(fs.readFileSync('./_components.json'))
  , entries = {}

entries.bundle = './index.js'

module.exports = {
  entry: entries,
  output: {
    path: __dirname + '/_components',
    filename: "[name].js"
  },
  module: {
    loaders: [
      { test: /\.styl$/, loader: "style-loader!css-loader!stylus-loader" },
      { test: /\.(js|jsx)?$/, loader: 'babel' }
    ]
  }
};
