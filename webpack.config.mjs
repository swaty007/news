import path, { dirname } from 'path'
import ESLintPlugin from 'eslint-webpack-plugin'
import { fileURLToPath } from 'url'
import nodeExternals from 'webpack-node-externals'
// import MiniCssExtractPlugin from 'mini-css-extract-plugin'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// const path = require('path')
// const ESLintPlugin = require('eslint-webpack-plugin')
// const nodeExternals = require('webpack-node-externals')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')

export default {
  // module.exports = {
  entry: {
    App: ['./parser/parser.ts'], //, './scss/style.scss'
    // vendor: [
    // 'vue',
    // 'vue-router',
    // ]
  },
  target: 'node',
  watch: true,
  output: {
    path: path.resolve(__dirname, './parser'),
    filename: 'scripts-bundled.cjs',
  },
  module: {
    rules: [
      // {
      //     test: /\.vue$/,
      //     loader: 'vue-loader'
      // },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          // loader: 'ts-loader',
          loader: 'babel-loader',
          options: {
            // presets: ['@babel/preset-env', '@babel/preset-typescript'],
            // plugins: [['@babel/transform-runtime']], //"@babel/plugin-syntax-import-assertions"
          },
        },
      },
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        options: {
          // appendTsSuffixTo: [/\.vue$/],
        },
        exclude: /node_modules/,
      },
      // {
      //   test: /\.(s*)css$/,
      //   use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      // },
      // {
      //   test: /\.jade$/,
      //   use: ['pug-loader'],
      // },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'js'),
    compress: true,
    port: 9000,
  },
  resolve: {
    extensions: ['.js', '.ts', '.cjs'],
    alias: {
      // 'vue$': 'vue/dist/vue.common.js',
      // 'vue$': 'vue/dist/vue.esm.js',
    },
  },
  experiments: {
    // outputModule: true,
  },
  plugins: [
    // убедитесь что подключили плагин!
    // new VueLoaderPlugin()
    new ESLintPlugin(),
    // new MiniCssExtractPlugin({
    //   filename: '../scss/style.css',
    // }),
  ],
  externals: [ nodeExternals() ],
  // node: {
  //   fs: 'empty',
  // },
  // mode: 'production',
  mode: 'development',
}
