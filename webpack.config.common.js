const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".glsl"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.glsl$/, loader: "webpack-glsl-loader" },
    ],
  },
  plugins: [
    new CopyPlugin({
        patterns: [
            { from: "public" },
        ],
    }),
  ],
  externals: {
    "babylonjs": "BABYLON",
  },
}
