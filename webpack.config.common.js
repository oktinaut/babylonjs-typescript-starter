const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: '[name].[contenthash].js',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".glsl",".png"],
  },
  module: {
    rules: [
      { test: /\.png?$/, loader: "file-loader" },
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.glsl$/, loader: "webpack-glsl-loader" },
      //{ test: /\.(png|svg|jpg|jpeg|gif)$/, type: 'asset/resource',},
    ],
  },
  plugins: [
    new CopyPlugin({
        patterns: [
            { from: "src/images", to: "images" }
        ],
    }),
    new HtmlWebpackPlugin({
      template: "!!handlebars-loader!src/index.hbs",
    }),
  ],
}
