const webpack = require("webpack");

module.exports = {
  entry: { main: './src/index.js' },
  mode: 'production',
  module: {
   rules: [
     {
       test: /\.js$/,
       loaders: ['babel-loader'],
       exclude: /node_modules/ 
    }
   ]
  },
  output: {
    filename: 'redux-rails.js',
    library: 'Redux-Rails',
    libraryTarget: 'umd'
  }
}
