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
    main: "./index.js"
  },
  output: {
    path: "dist",
    filename: "index.js"
  },
  devtool: "cheap-module-eval-source-map",
  resolve: {
    alias: {
      "redux-rails": path.resolve(
        path.join(__dirname, "..", "src", "index.js")
      )
    },
    extensions: ["", ".js", ".jsx"]
  }
}
