const webpack = require("webpack");
const path = require('path');

module.exports = {
  module: {
   loaders: [
     {
       test: /\.(js|jsx)$/,
       loader: ["babel-loader"],
       exclude: /node_modules/,
       query: {
          presets: ['es2015', 'stage-3', 'react']
      }
     }
   ]
  },
  entry: {
    main: "./src/index.js"
  },
  output: {
    library: 'Redux-Rails',
    libraryTarget: 'umd'
  },
  devtool: "cheap-module-eval-source-map"
}
