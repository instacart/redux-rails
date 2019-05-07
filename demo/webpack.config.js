const webpack = require("webpack");
const path = require('path');

module.exports = {
  mode: 'development',
  module: {
    rules: [
     {
       test: /\.(js|jsx)$/,
       loader: ["babel-loader"],
       exclude: /node_modules/,
     }
   ]
  },
  entry: {
    main: "./index.js"
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.js"
  },
  devtool: "cheap-module-eval-source-map",
  resolve: {
    alias: {
      "redux-rails": path.resolve(
        path.join(__dirname, "..", "src", "index.js")
      )
    },
    extensions: [".js", ".jsx"]
  }
}
