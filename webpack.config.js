const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const path = require('path')

const anaylzerEnabled = process.env.analyze || false

console.log('director: ', __dirname)

module.exports = {
  devtool: false,
  entry: path.join(__dirname, 'src', 'index.js'),
  externals: {
    redux: {
      commonjs: 'redux',
      commonjs2: 'redux',
      amd: 'redux',
      root: 'redux'
    }
  },
  mode: 'production',
  module: {
   rules: [
     {
       test: /\.js$/,
       loaders: ['babel-loader'],
       exclude: /node_modules/,
    }
   ]
  },
  output: {
    filename: 'redux-rails.js',
    library: 'redux-rails',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this'
  },
  plugins: [
    anaylzerEnabled && new BundleAnalyzerPlugin()
  ].filter(i => !!i) // filter out false items
}
